import { describe, expect, it } from "vitest";
import { parseStimulusForm } from "@/lib/stimuli/form";

describe("stimulus form parsing", () => {
  it("parses editable stimulus registration fields", () => {
    const formData = new FormData();
    formData.set("name", "cachorro");
    formData.set("category", "animal");
    formData.set("className", "animal domestico");
    formData.set("functionText", "companhia");
    formData.set("characteristics", "late");
    formData.set("imageUrl", "https://example.com/dog.png");
    formData.set("notes", "  imagem revisada  ");
    formData.set("active", "inactive");

    expect(parseStimulusForm(formData)).toEqual({
      name: "cachorro",
      category: "animal",
      className: "animal domestico",
      functionText: "companhia",
      characteristics: "late",
      imageUrl: "https://example.com/dog.png",
      notes: "imagem revisada",
      active: false
    });
  });

  it("clears optional fields when the editable stimulus form is left blank", () => {
    const formData = new FormData();
    formData.set("name", "copo");
    formData.set("category", "");
    formData.set("className", " ");
    formData.set("functionText", "");
    formData.set("characteristics", "");
    formData.set("imageUrl", " ");
    formData.set("notes", "");
    formData.set("active", "active");

    expect(parseStimulusForm(formData)).toEqual({
      name: "copo",
      category: null,
      className: null,
      functionText: null,
      characteristics: null,
      imageUrl: null,
      notes: null,
      active: true
    });
  });
});
