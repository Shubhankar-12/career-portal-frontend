import { create } from "zustand"

interface SectionContent {
  id: string
  type: "hero" | "about" | "life" | "perks" | "custom"
  title: string
  content: string
  order: number
}

interface BuilderStore {
  companyId: string | null
  sections: SectionContent[]
  theme: {
    primaryColor: string
    secondaryColor: string
    textColor: string
    backgroundColor: string
  }
  setSections: (sections: SectionContent[]) => void
  updateSection: (id: string, data: Partial<SectionContent>) => void
  setTheme: (theme: BuilderStore["theme"]) => void
  setCompanyId: (id: string) => void
  reorderSections: (sections: SectionContent[]) => void
}

export const useBuilderStore = create<BuilderStore>((set) => ({
  companyId: null,
  sections: [],
  theme: {
    primaryColor: "#10b981",
    secondaryColor: "#404040",
    textColor: "#ffffff",
    backgroundColor: "#0a0a0a",
  },
  setSections: (sections) => set({ sections }),
  updateSection: (id, data) =>
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  setTheme: (theme) => set({ theme }),
  setCompanyId: (id) => set({ companyId: id }),
  reorderSections: (sections) => set({ sections }),
}))
