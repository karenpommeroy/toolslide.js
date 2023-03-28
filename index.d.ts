declare module "toolslide.js" {
    export type AnimationEasing = "ease" | "ease-in" | "ease-out" | "ease-in-out";
    export type AnimationType = "crossfade" | "slide" | "slidefade";
    export type Animation = {
        type: AnimationType;
        easing: AnimationEasing;
        speed: string;
    }

    export interface IToolSlide {
        open: () => void;
        close: () => void;
        isOpen: () => boolean;
        isActive: (target: string) => boolean;
        setActiveById: (elementId: string) => void;
        setActiveByIndex: (index: number) => void;
    }

    export interface IToolSlideOptions {
        activePanel?: string | number | Element;
        position?: "left" | "right" | "top" | "bottom";
        height?: string | number;
        width?: string | number;
        startOpen?: boolean;
        closeable?: boolean;
        minClosedSize?:string | number;
        toggleButton?: string | Element;
        embed?: boolean;
        navigationItemWidth?: string | number;
        navigationItemHeight?: string | number;
        navigationOffsetX?: string | number;
        navigationOffsetY?: string | number;
        autoclose?: boolean;
        autocloseDelay?: number;
        clickOutsideToClose?: boolean;
        animations?: {
            replace?: string | Animation;
            toggle?: string | Animation;
        },
        listeners?: {
            beforeOpen?: (panel: Element) => void;
            afterOpen?: (panel: Element) => void;
            beforeClose?: (panel: Element) => void;
            afterClose?: (panel: Element) => void;
            beforeToggle?: (oldContent: Element, newContent: Element) => void;
            afterToggle?: (oldContent: Element, newContent: Element) => void;
        }
    }

    declare function toolslide(element: string | Element, options?: IToolSlideOptions): IToolSlide;

    export default toolslide;
}