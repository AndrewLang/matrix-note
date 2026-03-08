export const ViewOrientations = {
    Horizontal: "horizontal",
    Vertical: "vertical"
} as const;

export type ViewOrientation = typeof ViewOrientations[keyof typeof ViewOrientations];