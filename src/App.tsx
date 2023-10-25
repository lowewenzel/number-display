import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import {
  useQueryParams,
  NumberParam,
  StringParam,
  ArrayParam,
  QueryParamProvider,
  BooleanParam,
} from "use-query-params";
import { WindowHistoryAdapter } from "use-query-params/adapters/window";
import { ArrowsPointingOutIcon, LinkIcon } from "@heroicons/react/24/solid";
import { useHotkeys } from "react-hotkeys-hook";
import Clock from 'react-live-clock';


const PLACEHOLDER = `313
54
193
266
51
375
425`;

const arrayifyLineup = (lineup: string) => {
  if (!lineup) {
    return [];
  }

  return lineup.split("\n");
};

const Header = () => (
  <div className="w-full h-16 flex justify-between items-center border-b-[1px] border-b-gray-400 py-6 px-6 sm:px-20">
    <div className="flex items-center justify-center">
      <h2>numberdisplay.io</h2>
    </div>
    <div className="hidden sm:block">
      <a href="https://wnzls.com"><h2>wnzls.com</h2></a>
    </div>
  </div>
);

interface RealSize {
  [key: string]: number;
}

interface Variants {
  background: string[];
  font: string[];
  size: string[];
  realSize: RealSize;
}

const VARIANTS: Variants = {
  background: ["white", "black", "gradient"],
  font: ["jetbrains", "dsdigital", "arial"],
  size: ["text-sm", "text-2xl", "text-4xl"],
  realSize: {
    "text-sm": 5,
    "text-2xl": 3.5,
    "text-4xl": 2,
  },
};

const classToAdd = (variantCategory: string, variant: string) => {
  switch (variantCategory) {
    case "background":
      return `custom-bg-${variant}`;
    case "font":
      return `custom-font-${variant}`;
    case "size":
      return variant;
    case "realSize":
      return VARIANTS.realSize[variant];
    case "color":
      return variant === "white" ? "text-black" : "text-white";
    default:
      return "";
  }
};

interface SelectionSquareProps {
  variantCategory: string;
  variant: string;
  selected?: boolean;
  children?: ReactNode;
  onClick: () => void;
}
const SelectionSquare = ({
  variantCategory,
  variant,
  children,
  selected,
  onClick,
}: SelectionSquareProps) => {
  const finalClasses = useCallback(
    () => classToAdd(variantCategory, variant),
    [variantCategory, variant]
  );

  return (
    <div
      onClick={onClick}
      className={`rounded cursor-pointer w-24 aspect-video  text-2xl ${
        selected
          ? "outline outline-4 outline-gray-400"
          : "border-[1px] border-gray-300 "
      } mr-4 flex-col flex justify-center items-center font-bold ${finalClasses()}`}
    >
      {children}
    </div>
  );
};

const MAX_CHARS = 6;

const App = () => {
  const [inputLineup, setInputLineup] = useState("");
  const [lineup, setLineup] = useState(["123"]);
  const [lineupIndex, setLineupIndex] = useState(0);
  const [chosenBg, setChosenBg] = useState("black");
  const [chosenFont, setChosenFont] = useState("dsdigital");
  const [chosenSize, setChosenSize] = useState("text-2xl");
  const [fullScreen, setFullScreen] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [fontWidth, setFontWidth] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useQueryParams({
    v: ArrayParam, // values
    b: StringParam, // background
    f: StringParam, // font
    s: StringParam, // size
    i: NumberParam, // index
    c: BooleanParam, // clock
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTextarea = useCallback(
    (event: FormEvent<HTMLTextAreaElement>) => {
      const value = event.currentTarget.value;
      const array = arrayifyLineup(value);
      let valid = true;
      setDirty(true);

      array.forEach((v) => {
        if (v.length > MAX_CHARS) {
          valid = false;
        }
      });

      if (valid) {
        setInputLineup(value);
      }
    },
    [setInputLineup, setDirty]
  );

  const handleNavigate = useCallback(
    (previous = false) => {
      if (previous) {
        const previous = lineupIndex - 1;
        if (previous >= 0) {
          setLineupIndex(previous);
        }
      } else {
        const next = lineupIndex + 1;
        if (lineupIndex < lineup.length - 1) {
          setLineupIndex(next);
        }
      }
    },
    [lineupIndex, lineup]
  );

  useHotkeys("left, pagedown", () => handleNavigate(true), {preventDefault: true});
  useHotkeys("right, space, pageup", () => handleNavigate(), {preventDefault: true});
  useHotkeys("escape", () => toggleFullScreen(true));
  useHotkeys("f", () => toggleFullScreen());
  useHotkeys("c", () => toggleClock());

  const fullScreenClasses = useMemo(() => {
    return fullScreen
      ? "rounded-none fixed top-0 left-0 right-0 bottom-0 cursor-none"
      : "relative rounded-2xl aspect-video";
  }, [fullScreen]);

  const finalClasses = useMemo(
    () =>
      [
        classToAdd("background", chosenBg),
        classToAdd("font", chosenFont),
        // classToAdd("realSize", chosenSize),
        classToAdd("color", chosenBg),
        fullScreenClasses,
      ].join(" "),
    [chosenBg, chosenFont, fullScreenClasses]
  );

  const handleSave = useCallback(() => {
    const arrayLineup = arrayifyLineup(inputLineup);
    setLineup(arrayLineup);
    if (arrayLineup.length !== lineup.length) {
      setLineupIndex(0);
    }
    setQuery({
      v: arrayLineup,
      b: chosenBg,
      f: chosenFont,
      s: chosenSize,
      c: showClock,
    });
    setDirty(false);
  }, [
    setLineup,
    inputLineup,
    chosenBg,
    chosenFont,
    chosenSize,
    setLineupIndex,
    lineup.length,
    setQuery,
    setDirty,
    showClock,
  ]);

  const handleCopy = useCallback(async () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);

    await new Promise((r) => setTimeout(r, 3000));

    setCopied(false);
  }, [setCopied]);

  const currentLineupNumber = useMemo(() => {
    return lineup[lineupIndex];
  }, [lineup, lineupIndex]);

  const handleResize = useCallback(() => {
    const width = containerRef.current?.clientWidth;
    setFontWidth(width! / VARIANTS.realSize[chosenSize]);
  }, [setFontWidth, containerRef, chosenSize]);

  const handleSelectOption = useCallback(
    (variantCategory: string, variant: string) => {
      switch (variantCategory) {
        case "background":
          return setChosenBg(variant);
        case "font":
          return setChosenFont(variant);
        case "size":
          setChosenSize(variant);
          return handleResize();
        default:
          break;
      }
    },
    [setChosenBg, setChosenFont, setChosenSize, handleResize]
  );
  const toggleFullScreen = useCallback(
    (turnOff?: boolean) => {
      if (turnOff !== undefined) {
        setFullScreen(false);
      } else {
        setFullScreen(!fullScreen);
      }
    },
    [setFullScreen, fullScreen]
  );

  const toggleClock = useCallback(() => {
    setShowClock(!showClock)
  }, [setShowClock, showClock])

  useEffect(() => {
    window.removeEventListener("resize", handleResize);
    handleResize();
    window.addEventListener("resize", handleResize);
  }, [chosenSize, fullScreen, handleResize]);

  useEffect(() => {
    const { v, b, f, s, c } = query;
    if (v) {
      setLineup(v as string[]);
      setInputLineup(v.join("\n"));
    }
    if (b && VARIANTS.background.includes(b)) {
      setChosenBg(b);
    }
    if (f && VARIANTS.font.includes(f)) {
      setChosenFont(f);
    }
    if (s && VARIANTS.size.includes(s)) {
      setChosenSize(s);
    }
    if(c) {
      setShowClock(c)
    }
  }, [query, setShowClock]);

  return (
    <div className="w-screen min-h-screen flex flex-col items-center">
      <Header />
      <div className="w-full h-full flex-1 flex-col sm:flex-row flex">
        <div className=" w-full sm:w-1/2 border-r-[1px] border-r-gray-400 border-b-[1px] border-b-gray-400 p-6 sm:p-20">
          <h1 className="font-bold text-2xl">Sequential Display</h1>
          <p className="mt-2">
            Display any set of numbers (like a custom counter). <br />
            Separate numbers by a new line. <br />
            Use extra lines to add blanks. <br /> <br />
            Press Update to save.
          </p>

          <div className="mt-8">
            <h2 className="font-bold mb-2">Numbers to display</h2>
            <textarea
              value={inputLineup}
              onChange={handleTextarea}
              className="p-2.5 min-h-[200px] text-center w-full text-gray-900 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
              placeholder={PLACEHOLDER}
            ></textarea>
          </div>
          <div className="mt-6">
            <h2 className="font-bold mb-2">Background</h2>
            <div className="flex items-center">
              {VARIANTS.background.map((bg) => {
                return (
                  <SelectionSquare
                    onClick={() => {
                      handleSelectOption("background", bg);
                    }}
                    selected={chosenBg === bg}
                    key={bg}
                    variantCategory="background"
                    variant={bg}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-4">
            <h2 className="font-bold mb-2">Font</h2>
            <div className="flex items-center">
              {VARIANTS.font.map((font) => {
                return (
                  <SelectionSquare
                    onClick={() => {
                      handleSelectOption("font", font);
                    }}
                    selected={chosenFont === font}
                    key={font}
                    variantCategory="font"
                    variant={font}
                  >
                    123
                  </SelectionSquare>
                );
              })}
            </div>
          </div>
          <div className="mt-4">
            <h2 className="font-bold mb-2">Size</h2>
            <div className="flex items-center">
              {VARIANTS.size.map((size) => {
                return (
                  <SelectionSquare
                    onClick={() => {
                      handleSelectOption("size", size);
                    }}
                    selected={chosenSize === size}
                    key={size}
                    variantCategory="size"
                    variant={size}
                  >
                    123
                  </SelectionSquare>
                );
              })}
            </div>
          </div>
          <div className="mt-16 w-full flex justify-start">
            <button
              onClick={handleSave}
              className="p-2 px-4 border-[1px] border-gray-500 bg-black text-white"
            >
              Update
            </button>
            <div onClick={toggleClock} className="flex items-center ml-4 cursor-pointer">
              <input checked={showClock} className="mr-2" type="checkbox"></input>
              <p>Clock (<b>c</b>)</p>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-1/2 flex flex-col p-6 sm:p-20 justify-between select-none">
          <div></div>
          <div className="relative w-full">
            <div
              onResize={handleResize}
              className={` w-full flex flex-col justify-center text-center font-bold items-center overflow-hidden  ${finalClasses}`}
            >
              <div
                ref={containerRef}
                className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center"
              >
                <div
                  className="absolute top-0 bottom-0 left-0 right-2/3 cursor-pointer"
                  onClick={() => handleNavigate(true)}
                ></div>
                <div
                  className="absolute top-0 bottom-0 right-0 left-2/3 cursor-pointer"
                  onClick={() => handleNavigate()}
                ></div>
                <div
                  className={`cursor-pointer absolute top-0 right-0 left-0 flex bg-opacity-25 justify-center h-8 sm:h-16 p-3 transition-all opacity-0 hover:opacity-100 ${
                    chosenBg === 'white' ? " bg-black text-white" : "bg-white text-black"
                  }`}
                  onClick={() => toggleFullScreen()}
                >
                  <ArrowsPointingOutIcon className="text-white" />
                </div>
                <span
                  style={{ fontSize: `${fontWidth}px` }}
                  className="top-1/2 left-1/2"
                >
                  {currentLineupNumber}
                </span>
              </div>
              {
                showClock &&
                <div className="absolute top-0 right-3" style={{fontSize: `${fontWidth / 4 }px`}}>
                  <Clock format={'HH:mm:ss'} ticking={true}/>
                </div>
                }
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-4 text-red-600 font-bold">
            {
              dirty && 'You have unsaved changes.'
            }&nbsp;
            </p>
            <p>
              Navigate between numbers with <strong>arrow keys</strong> or <strong>spacebar</strong>. Press <strong>f</strong> or tap the top to
              fullscreen.
            </p>
            <br />
            <p>Copy the link to send to others or save your progress.</p>
            <br />
            <button
              onClick={handleCopy}
              className="p-2 px-4 border-[1px] flex items-center"
            >
              {" "}
              {!copied && <LinkIcon width={20} className="mr-2" />}
              {copied ? "Copied to clipboard!" : "Share link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Providers = () => {
  return (
    <QueryParamProvider adapter={WindowHistoryAdapter}>
      <App />
    </QueryParamProvider>
  );
};

export default Providers;
