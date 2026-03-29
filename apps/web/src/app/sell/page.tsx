"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  FileText,
  Camera,
  DollarSign,
  CheckCircle,
  Upload,
  X,
  Loader2,
  ChevronDown,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/context/AuthContext";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Make {
  id: string;
  name: string;
}

interface Model {
  id: string;
  name: string;
  make_id: string;
}

interface Variant {
  id: string;
  name: string;
  model_id: string;
  fuel_type: string;
  transmission: string;
}

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

interface FormData {
  make_id: string;
  model_id: string;
  variant_id: string;
  year: string;
  mileage: string;
  condition: string;
  color: string;
  owners: string;
  description: string;
  photos: PhotoFile[];
  price: string;
  negotiable: boolean;
  city: string;
}

const STEPS = [
  { label: "Vehicle", icon: Car },
  { label: "Details", icon: FileText },
  { label: "Photos", icon: Camera },
  { label: "Price", icon: DollarSign },
  { label: "Review", icon: CheckCircle },
];

const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];
const COLORS = [
  "White",
  "Black",
  "Silver",
  "Grey",
  "Red",
  "Blue",
  "Brown",
  "Green",
  "Beige",
  "Other",
];
const CITIES = [
  "Srinagar",
  "Jammu",
  "Anantnag",
  "Baramulla",
  "Sopore",
  "Pulwama",
  "Budgam",
  "Kupwara",
  "Bandipora",
  "Ganderbal",
  "Shopian",
  "Kulgam",
  "Kathua",
  "Udhampur",
  "Rajouri",
  "Poonch",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function formatPrice(value: string): string {
  const num = parseInt(value.replace(/,/g, ""), 10);
  if (isNaN(num)) return "";
  return num.toLocaleString("en-IN");
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function SellPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  /* Step state */
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Dropdown data */
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  /* Form data */
  const [form, setForm] = useState<FormData>({
    make_id: "",
    model_id: "",
    variant_id: "",
    year: "",
    mileage: "",
    condition: "",
    color: "",
    owners: "1",
    description: "",
    photos: [],
    price: "",
    negotiable: true,
    city: "Srinagar",
  });

  /* Drag-and-drop */
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- Fetch makes ---- */
  useEffect(() => {
    supabaseBrowser
      .from("car_makes")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setMakes(data);
      });
  }, []);

  /* ---- Fetch models when make changes ---- */
  useEffect(() => {
    if (!form.make_id) {
      setModels([]);
      return;
    }
    supabaseBrowser
      .from("car_models")
      .select("id, name, make_id")
      .eq("make_id", form.make_id)
      .order("name")
      .then(({ data }) => {
        if (data) setModels(data);
      });
  }, [form.make_id]);

  /* ---- Fetch variants when model changes ---- */
  useEffect(() => {
    if (!form.model_id) {
      setVariants([]);
      return;
    }
    supabaseBrowser
      .from("car_variants")
      .select("id, name, model_id, fuel_type, transmission")
      .eq("model_id", form.model_id)
      .order("name")
      .then(({ data }) => {
        if (data) setVariants(data);
      });
  }, [form.model_id]);

  /* ---- Cleanup object URLs on unmount ---- */
  useEffect(() => {
    return () => {
      form.photos.forEach((p) => URL.revokeObjectURL(p.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Helpers ---- */
  const updateForm = useCallback(
    (key: keyof FormData, value: FormData[keyof FormData]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        // Reset dependants
        if (key === "make_id") {
          next.model_id = "";
          next.variant_id = "";
        }
        if (key === "model_id") {
          next.variant_id = "";
        }
        return next;
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    []
  );

  const addPhotos = useCallback((files: FileList | File[]) => {
    const newPhotos: PhotoFile[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: generateId(),
      }));
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos].slice(0, 20),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photos;
      return next;
    });
  }, []);

  const removePhoto = useCallback((id: string) => {
    setForm((prev) => {
      const photo = prev.photos.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return {
        ...prev,
        photos: prev.photos.filter((p) => p.id !== id),
      };
    });
  }, []);

  /* ---- Validation ---- */
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};

    if (s === 0) {
      if (!form.make_id) errs.make_id = "Select a make";
      if (!form.model_id) errs.model_id = "Select a model";
      if (!form.year) errs.year = "Select a year";
    }
    if (s === 1) {
      if (!form.mileage) errs.mileage = "Enter mileage";
      if (!form.condition) errs.condition = "Select condition";
      if (!form.color) errs.color = "Select color";
    }
    if (s === 2) {
      if (form.photos.length < 6)
        errs.photos = `Upload at least 6 photos (${form.photos.length}/6)`;
    }
    if (s === 3) {
      if (!form.price) errs.price = "Enter a price";
      if (!form.city) errs.city = "Select a city";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  /* ---- Submit ---- */
  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);

    try {
      // 1. Create listing
      const { data: listing, error: listingError } = await supabaseBrowser
        .from("listings")
        .insert({
          user_id: user.id,
          make_id: form.make_id,
          model_id: form.model_id,
          variant_id: form.variant_id || null,
          year: parseInt(form.year, 10),
          mileage: parseInt(form.mileage.replace(/,/g, ""), 10),
          condition: form.condition.toLowerCase(),
          color: form.color,
          owners: parseInt(form.owners, 10),
          description: form.description || null,
          price: parseInt(form.price.replace(/,/g, ""), 10),
          negotiable: form.negotiable,
          city: form.city,
          status: "pending_review",
        })
        .select("id")
        .single();

      if (listingError || !listing) throw listingError;

      // 2. Upload photos
      const photoInserts = [];
      for (let i = 0; i < form.photos.length; i++) {
        const photo = form.photos[i];
        const ext = photo.file.name.split(".").pop() ?? "jpg";
        const path = `${listing.id}/${i}.${ext}`;

        const { error: uploadError } = await supabaseBrowser.storage
          .from("car-photos")
          .upload(path, photo.file, { upsert: true });

        if (uploadError) {
          console.error("Photo upload error:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabaseBrowser.storage.from("car-photos").getPublicUrl(path);

        photoInserts.push({
          listing_id: listing.id,
          url: publicUrl,
          display_order: i,
          is_primary: i === 0,
        });
      }

      if (photoInserts.length > 0) {
        await supabaseBrowser.from("listing_photos").insert(photoInserts);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  /* ---- Drag handlers ---- */
  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length) addPhotos(e.dataTransfer.files);
  }

  /* ---- Lookups ---- */
  const selectedMake = makes.find((m) => m.id === form.make_id);
  const selectedModel = models.find((m) => m.id === form.model_id);
  const selectedVariant = variants.find((v) => v.id === form.variant_id);

  /* ---------------------------------------------------------------- */
  /*  Render: Auth loading                                             */
  /* ---------------------------------------------------------------- */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render: Not authenticated                                        */
  /* ---------------------------------------------------------------- */
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <LogIn className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text">Sign in to Sell</h1>
        <p className="mt-2 text-text-secondary">
          You need to be signed in to list your car on Carvaan.
        </p>
        <button
          onClick={() => router.push("/auth/login")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          <LogIn className="h-5 w-5" />
          Sign In
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render: Success                                                  */
  /* ---------------------------------------------------------------- */
  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-text">Listing Submitted!</h1>
        <p className="mt-3 text-text-secondary max-w-md mx-auto">
          Your car has been submitted for review. Our team will verify the
          details and your listing will go live within 24 hours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/listings")}
            className="rounded-xl bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            View My Listings
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setForm({
                make_id: "",
                model_id: "",
                variant_id: "",
                year: "",
                mileage: "",
                condition: "",
                color: "",
                owners: "1",
                description: "",
                photos: [],
                price: "",
                negotiable: true,
                city: "Srinagar",
              });
            }}
            className="rounded-xl border border-border px-6 py-3 text-text font-semibold hover:bg-surface transition-colors"
          >
            List Another Car
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render: Form                                                     */
  /* ---------------------------------------------------------------- */
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text">Sell Your Car</h1>
        <p className="mt-2 text-text-secondary">
          Fill in the details to list your car on Carvaan
        </p>
      </div>

      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div key={s.label} className="flex flex-col items-center flex-1">
                <button
                  onClick={() => {
                    if (isDone) setStep(i);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : isDone
                      ? "bg-primary/20 text-primary cursor-pointer"
                      : "bg-border/50 text-text-tertiary"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </button>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    isActive
                      ? "text-primary"
                      : isDone
                      ? "text-primary/70"
                      : "text-text-tertiary"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-border/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
        {/* ---- Step 0: Vehicle ---- */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-text mb-1">
              Select Your Vehicle
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Start by choosing the make and model of your car.
            </p>

            {/* Make */}
            <SelectField
              label="Make"
              value={form.make_id}
              onChange={(v) => updateForm("make_id", v)}
              error={errors.make_id}
              placeholder="Select make"
              options={makes.map((m) => ({ value: m.id, label: m.name }))}
            />

            {/* Model */}
            <SelectField
              label="Model"
              value={form.model_id}
              onChange={(v) => updateForm("model_id", v)}
              error={errors.model_id}
              placeholder="Select model"
              disabled={!form.make_id}
              options={models.map((m) => ({ value: m.id, label: m.name }))}
            />

            {/* Year */}
            <SelectField
              label="Year"
              value={form.year}
              onChange={(v) => updateForm("year", v)}
              error={errors.year}
              placeholder="Select year"
              options={YEARS.map((y) => ({ value: y, label: y }))}
            />

            {/* Variant (optional) */}
            <SelectField
              label="Variant (Optional)"
              value={form.variant_id}
              onChange={(v) => updateForm("variant_id", v)}
              placeholder="Select variant"
              disabled={!form.model_id}
              options={variants.map((v) => ({
                value: v.id,
                label: `${v.name} - ${v.fuel_type} ${v.transmission}`,
              }))}
            />
          </div>
        )}

        {/* ---- Step 1: Details ---- */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-text mb-1">Car Details</h2>
            <p className="text-sm text-text-secondary mb-4">
              Provide details about the condition and history of your car.
            </p>

            {/* Mileage */}
            <InputField
              label="Mileage (km)"
              value={form.mileage}
              onChange={(v) =>
                updateForm("mileage", v.replace(/[^0-9]/g, ""))
              }
              error={errors.mileage}
              placeholder="e.g. 45000"
              type="text"
              inputMode="numeric"
            />

            {/* Condition */}
            <SelectField
              label="Condition"
              value={form.condition}
              onChange={(v) => updateForm("condition", v)}
              error={errors.condition}
              placeholder="Select condition"
              options={CONDITIONS.map((c) => ({ value: c, label: c }))}
            />

            {/* Color */}
            <SelectField
              label="Color"
              value={form.color}
              onChange={(v) => updateForm("color", v)}
              error={errors.color}
              placeholder="Select color"
              options={COLORS.map((c) => ({ value: c, label: c }))}
            />

            {/* Owners */}
            <SelectField
              label="Number of Owners"
              value={form.owners}
              onChange={(v) => updateForm("owners", v)}
              options={["1", "2", "3", "4", "5+"].map((o) => ({
                value: o,
                label: o === "1" ? "1st Owner" : `${o} Owners`,
              }))}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                placeholder="Any additional details about your car (service history, modifications, etc.)"
              />
            </div>
          </div>
        )}

        {/* ---- Step 2: Photos ---- */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-text mb-1">Upload Photos</h2>
            <p className="text-sm text-text-secondary mb-4">
              Upload at least 6 clear photos. The first photo will be the cover
              image.
            </p>

            {/* Dropzone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary font-medium">
                Drag & drop photos here
              </p>
              <p className="text-sm text-text-tertiary mt-1">
                or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files) addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {errors.photos && (
              <p className="flex items-center gap-1.5 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                {errors.photos}
              </p>
            )}

            {/* Photo grid */}
            {form.photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-text-tertiary">
              {form.photos.length}/20 photos uploaded (minimum 6)
            </p>
          </div>
        )}

        {/* ---- Step 3: Price ---- */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-text mb-1">Set Your Price</h2>
            <p className="text-sm text-text-secondary mb-4">
              Set a competitive price for your vehicle.
            </p>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Asking Price (INR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.price ? formatPrice(form.price) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    updateForm("price", raw);
                  }}
                  className="w-full rounded-xl border border-border bg-bg pl-8 pr-4 py-3 text-text text-lg font-semibold placeholder:text-text-tertiary placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="e.g. 5,50,000"
                />
              </div>
              {errors.price && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-error">
                  <AlertCircle className="h-4 w-4" />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Negotiable */}
            <div className="flex items-center justify-between p-4 bg-bg rounded-xl border border-border">
              <div>
                <p className="font-medium text-text">Price Negotiable?</p>
                <p className="text-sm text-text-secondary">
                  Allow buyers to make offers
                </p>
              </div>
              <button
                onClick={() => updateForm("negotiable", !form.negotiable)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  form.negotiable ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    form.negotiable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* City */}
            <SelectField
              label="City"
              value={form.city}
              onChange={(v) => updateForm("city", v)}
              error={errors.city}
              options={CITIES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        )}

        {/* ---- Step 4: Review ---- */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-text mb-1">
              Review Your Listing
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Please review all details before submitting.
            </p>

            {/* Vehicle */}
            <ReviewSection title="Vehicle">
              <ReviewItem label="Make" value={selectedMake?.name} />
              <ReviewItem label="Model" value={selectedModel?.name} />
              <ReviewItem label="Year" value={form.year} />
              {selectedVariant && (
                <ReviewItem
                  label="Variant"
                  value={`${selectedVariant.name} (${selectedVariant.fuel_type}, ${selectedVariant.transmission})`}
                />
              )}
            </ReviewSection>

            {/* Details */}
            <ReviewSection title="Details">
              <ReviewItem
                label="Mileage"
                value={form.mileage ? `${parseInt(form.mileage).toLocaleString("en-IN")} km` : ""}
              />
              <ReviewItem label="Condition" value={form.condition} />
              <ReviewItem label="Color" value={form.color} />
              <ReviewItem
                label="Owners"
                value={form.owners === "1" ? "1st Owner" : `${form.owners} Owners`}
              />
              {form.description && (
                <div className="col-span-2">
                  <p className="text-sm text-text-tertiary">Description</p>
                  <p className="text-text">{form.description}</p>
                </div>
              )}
            </ReviewSection>

            {/* Photos */}
            <ReviewSection title={`Photos (${form.photos.length})`}>
              <div className="col-span-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                {form.photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden border border-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </ReviewSection>

            {/* Price */}
            <ReviewSection title="Price">
              <ReviewItem
                label="Asking Price"
                value={form.price ? `₹${parseInt(form.price).toLocaleString("en-IN")}` : ""}
              />
              <ReviewItem
                label="Negotiable"
                value={form.negotiable ? "Yes" : "No"}
              />
              <ReviewItem label="City" value={form.city} />
            </ReviewSection>

            {errors.submit && (
              <div className="flex items-center gap-2 p-4 bg-error/10 rounded-xl text-error text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {step > 0 ? (
            <button
              onClick={prevStep}
              className="rounded-xl border border-border px-6 py-2.5 text-text font-medium hover:bg-bg transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="rounded-xl bg-primary px-8 py-2.5 text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-primary px-8 py-2.5 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 inline-flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Submitting..." : "Submit Listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                            */
/* ------------------------------------------------------------------ */

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl border bg-bg px-4 py-3 pr-10 text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-error" : "border-border"
          }`}
        >
          {placeholder && (
            <option value="" className="text-text-tertiary">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-bg px-4 py-3 text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
          error ? "border-error" : "border-border"
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-sm text-text-tertiary">{label}</p>
      <p className="font-medium text-text">{value || "-"}</p>
    </div>
  );
}
