import { describe, expect, it } from "vitest";
import { parseLearnerForm } from "@/lib/learners/form";

describe("learner form parsing", () => {
  it("parses editable learner registration fields", () => {
    const formData = new FormData();
    formData.set("name", "Crianca teste");
    formData.set("birthDate", "2020-05-10");
    formData.set("supportLevel", "Nivel 2 de suporte");
    formData.set("active", "inactive");
    formData.set("notes", "  Observacao objetiva  ");

    expect(parseLearnerForm(formData)).toEqual({
      name: "Crianca teste",
      birthDate: new Date("2020-05-10T00:00:00"),
      supportLevel: "Nivel 2 de suporte",
      notes: "Observacao objetiva",
      active: false
    });
  });

  it("clears optional fields when the editable form is left blank", () => {
    const formData = new FormData();
    formData.set("name", "Crianca teste");
    formData.set("birthDate", "");
    formData.set("supportLevel", "Nivel 1 de suporte");
    formData.set("active", "active");
    formData.set("notes", "   ");

    expect(parseLearnerForm(formData)).toEqual({
      name: "Crianca teste",
      birthDate: null,
      supportLevel: "Nivel 1 de suporte",
      notes: null,
      active: true
    });
  });
});
