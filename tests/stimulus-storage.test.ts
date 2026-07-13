import { describe, expect, it } from "vitest";
import { getUploadableStimulusImage } from "@/lib/stimuli/storage";

describe("stimulus image storage", () => {
  it("uses an image file selected in the stimulus form", () => {
    const file = new File(["image"], "dog.png", { type: "image/png" });

    expect(getUploadableStimulusImage(file)).toBe(file);
  });

  it("ignores empty or non-image file values", () => {
    expect(getUploadableStimulusImage(null)).toBeNull();
    expect(getUploadableStimulusImage("manual-url")).toBeNull();
    expect(getUploadableStimulusImage(new File([], "", { type: "" }))).toBeNull();
    expect(getUploadableStimulusImage(new File(["text"], "notes.txt", { type: "text/plain" }))).toBeNull();
  });
});
