"use client";

import type React from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { companyAPI, type Company } from "@/lib/api";
import { AuthGuard } from "@/components/shared/auth-guard";
import { SectionEditor, type SectionData } from "@/components/section-editor";
import { fileUploader } from "@/lib/utils";
import { toast } from "react-toastify";

function BuilderContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params["slug"] as string;
  const user = useAuthStore((state) => state.user);
  const [company, setCompany] = useState<Company | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const updateCompany = (field: Partial<Company>) => {
    if (!company) return;
    setCompany((prev) => (prev ? { ...prev, ...field } : null));
  };

  useEffect(() => {
    console.log("logo", company?.logo_url);
  }, [company?.logo_url, company?.logo_url?.url]);

  const handleUpload = async (type: "logo" | "cover") => {
    try {
      setLoading(true);
      const resp = await fileUploader(
        type === "logo" ? logo : cover,
        company?.name.toLowerCase().replace(/\s/g, "-")
      );
      console.log("response media", resp);
      setLoading(false);
      return resp;
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (type === "logo") {
        setLogo(selectedFile);
        const resp = await handleUpload("logo");
        // update company logo
        if (resp) {
          console.log("resp", resp);
          updateCompany({ logo_url: resp });
          setLogo(null);
        }
      }
      if (type === "cover") {
        setCover(selectedFile);
        const resp = await handleUpload("cover");
        // update company cover
        if (resp) {
          console.log("resp", resp);
          updateCompany({ banner_url: resp });
          setCover(null);
        }
      }
    }
  };

  const getCompanyData = async () => {
    if (!user) return;
    const comp = await companyAPI.getBySlug(slug);
    if (!comp || comp.user_id !== user.user_id) {
      router.push("/dashboard");
      return;
    }
    setCompany(comp);
    const initialSections: SectionData[] =
      comp.sections && comp.sections.length > 0
        ? comp.sections.map((sectionType, index) => ({
            id: sectionType._id,
            type: sectionType.type,
            title:
              sectionType.title.charAt(0).toUpperCase() +
              sectionType.title.slice(1),
            content: sectionType.content,
            order: sectionType.order ?? index,
          }))
        : [];
    setSections(initialSections);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    getCompanyData();
  }, [slug, user, router]);

  const handleThemeChange = async (field: string, value: string) => {
    if (!company) return;
    const updated: Company = {
      ...company,
      theme: { ...company.theme, [field]: value ?? "" },
    };
    setCompany(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // clone and reorder
    const newSections = [...sections];
    const draggedItem = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedItem);

    // ✅ update order field for each section
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index + 1, // keep order starting from 1
    }));

    setSections(reorderedSections);
    setDraggedIndex(null);
  };

  const handleSectionUpdate = (index: number, updatedSection: SectionData) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    setSections(newSections);
  };

  const handleRemoveSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);

    if (company) {
      const updatedSectionTypes = newSections.map((s) => s.type);
      setCompany({ ...company, sections: updatedSectionTypes });
      // companyAPI.update(company.id, { sections: updatedSectionTypes });
    }
  };

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    try {
      const updatedCompany = await companyAPI.update(company.company_id, {
        ...company,
        sections: sections,
      });
      if (updatedCompany) {
        setCompany(updatedCompany);
        toast.success("Company updated successfully");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = (sectionType: string) => {
    if (!company || company?.sections?.includes(sectionType)) return;

    const newSection: SectionData = {
      id: "",
      type: sectionType,
      title: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
      content: "",
      order: sections.length + 1,
    };

    setSections([...sections, newSection]);
    setCompany({
      ...company,
      sections: [...(company.sections ?? []), sectionType],
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!company) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-primary mb-1 block text-sm"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">Edit Company</h1>
          </div>
          <div className="space-x-4">
            <Link href={`/${slug}/preview`} className="btn-secondary">
              Preview
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Company Info */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Company Information</h2>
            <div className="card">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={company.name}
                    onChange={(e) =>
                      setCompany({ ...company, name: e.target.value })
                    }
                    className="input"
                  />
                </div>
                {/* Website */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={company.website}
                    onChange={(e) =>
                      setCompany({ ...company, website: e.target.value })
                    }
                    className="input"
                  />
                </div>
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {/* ✅ Preview existing logo */}
                    {company.logo_url?.url && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_S3_URL}/${company.logo_url.url}`}
                        alt="Logo Preview"
                        className="w-16 h-16 object-cover rounded-lg border border-border shadow-sm"
                      />
                    )}

                    {/* ✅ Custom File Upload */}
                    <label className="relative cursor-pointer bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
                      <span>Update Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => handleFileChange(e, "logo")}
                        className="absolute inset-0 opacity-0 cursor-pointer z-0"
                      />
                    </label>

                    {/* ✅ Show selected filename */}
                    {company.logo_url ? (
                      <span className="text-sm text-text-secondary italic truncate max-w-[200px]">
                        {company.logo_url.name}
                      </span>
                    ) : (
                      <span className="text-sm text-text-secondary italic">
                        No file selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Banner Image
                  </label>
                  <div className="flex flex-col gap-3">
                    {company.banner_url?.url && (
                      <img
                        src={
                          process.env.NEXT_PUBLIC_S3_URL +
                          "/" +
                          company.banner_url.url
                        }
                        alt="Banner Preview"
                        className="w-full h-32 object-cover rounded border"
                      />
                    )}
                    <label className="relative cursor-pointer bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center gap-2">
                      <span>Update Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => handleFileChange(e, "cover")}
                        className="absolute inset-0 opacity-0 cursor-pointer z-0"
                      />
                    </label>

                    {/* ✅ Show selected filename */}
                    {company.banner_url ? (
                      <span className="text-sm text-text-secondary italic truncate max-w-[200px]">
                        {company.banner_url.name}
                      </span>
                    ) : (
                      <span className="text-sm text-text-secondary italic">
                        No file selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Editor */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Theme & Colors</h2>
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={company?.theme?.primary_color || "#2563EB"}
                      onChange={(e) =>
                        handleThemeChange("primary_color", e.target.value)
                      }
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={company?.theme?.primary_color || "#2563EB"}
                      onChange={(e) =>
                        handleThemeChange("primary_color", e.target.value)
                      }
                      className="input flex-1"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={company?.theme?.secondary_color || "#0F172A"}
                      onChange={(e) =>
                        handleThemeChange("secondary_color", e.target.value)
                      }
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={company?.theme?.secondary_color || "#0F172A"}
                      onChange={(e) =>
                        handleThemeChange("secondary_color", e.target.value)
                      }
                      className="input flex-1"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={company?.theme?.text_color || "#E2E8F0"}
                      onChange={(e) =>
                        handleThemeChange("text_color", e.target.value)
                      }
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={company?.theme?.text_color || "#E2E8F0"}
                      onChange={(e) =>
                        handleThemeChange("text_color", e.target.value)
                      }
                      className="input flex-1"
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Background Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={company?.theme?.background_color || "#020617"}
                      onChange={(e) =>
                        handleThemeChange("background_color", e.target.value)
                      }
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={company?.theme?.background_color || "#020617"}
                      onChange={(e) =>
                        handleThemeChange("background_color", e.target.value)
                      }
                      className="input flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-medium mb-3">Live Theme Preview</p>
                <div
                  className="p-6 rounded-lg border-2 shadow-inner transition-all"
                  style={{
                    backgroundColor: company?.theme?.background_color,
                    borderColor: company?.theme?.primary_color,
                    color: company?.theme?.text_color,
                  }}
                >
                  <h3 className="font-bold text-lg mb-2">
                    Whitecarrot Technologies
                  </h3>
                  <p className="mb-4 text-sm opacity-80">
                    This is how your company theme will look on the careers
                    page.
                  </p>
                  <button
                    className="px-4 py-2 rounded font-semibold transition-all"
                    style={{
                      backgroundColor: company?.theme?.primary_color,
                      color: company?.theme?.text_color,
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sections with Drag & Drop */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Page Sections</h2>
            <p className="text-text-secondary text-sm">
              Drag sections to reorder, expand to edit rich content
            </p>
            <div className="space-y-3">
              {sections &&
                sections.map((section, index) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    index={index}
                    isDragging={draggedIndex === index}
                    onUpdate={(updated) => handleSectionUpdate(index, updated)}
                    onRemove={() => handleRemoveSection(index)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
            </div>

            {/* Add Section */}
            <div className="card">
              <p className="text-sm font-medium mb-3">Add New Section</p>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddSection(e.target.value);
                  }
                  e.target.value = "";
                }}
                className="input"
              >
                <option value="">Select a section...</option>
                <option value="hero">Hero</option>
                <option value="about">About</option>
                <option value="life">Life at Company</option>
                <option value="perks">Perks & Benefits</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function EditPage() {
  return (
    <AuthGuard>
      <BuilderContent />
    </AuthGuard>
  );
}
