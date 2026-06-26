"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  GOVERNORATE_NAMES,
  getDirectorates,
  getAreas,
} from "@/lib/locations";
import { CloseIcon, SearchIcon } from "./icons";
import styles from "./FilterBar.module.css";

type Period = "all" | "month" | "quarter" | "year" | "lastYear";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "all", label: "كل الفترات" },
  { value: "month", label: "هذا الشهر" },
  { value: "quarter", label: "آخر ثلاثة أشهر" },
  { value: "year", label: "هذا العام" },
  { value: "lastYear", label: "العام الماضي" },
];

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function currentYear() {
  return String(new Date().getFullYear());
}

function lastYear() {
  return String(new Date().getFullYear() - 1);
}

function quarterFrom() {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function inferPeriod(params: URLSearchParams): Period {
  const year = params.get("year");
  const month = params.get("month");
  const from = params.get("from");
  if (year === currentYear()) return "year";
  if (year === lastYear()) return "lastYear";
  if (month === currentMonth()) return "month";
  if (from) return "quarter";
  return "all";
}

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [governorate, setGovernorate] = useState(
    searchParams.get("governorate") ?? ""
  );
  const [directorate, setDirectorate] = useState(
    searchParams.get("directorate") ?? ""
  );
  const [area, setArea] = useState(searchParams.get("area") ?? "");
  const [period, setPeriod] = useState<Period>(inferPeriod(searchParams));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchParams.get("search") ?? "");
    setGovernorate(searchParams.get("governorate") ?? "");
    setDirectorate(searchParams.get("directorate") ?? "");
    setArea(searchParams.get("area") ?? "");
    setPeriod(inferPeriod(searchParams));
  }, [searchParams]);

  const directorates = governorate ? getDirectorates(governorate) : [];
  const areas =
    governorate && directorate ? getAreas(governorate, directorate) : [];

  function pushQuery(next: {
    search: string;
    governorate: string;
    directorate: string;
    area: string;
    period: Period;
  }) {
    const params = new URLSearchParams();
    if (next.search.trim()) params.set("search", next.search.trim());
    if (next.governorate) params.set("governorate", next.governorate);
    if (next.directorate) params.set("directorate", next.directorate);
    if (next.area) params.set("area", next.area);

    switch (next.period) {
      case "month":
        params.set("month", currentMonth());
        break;
      case "quarter":
        params.set("from", quarterFrom());
        break;
      case "year":
        params.set("year", currentYear());
        break;
      case "lastYear":
        params.set("year", lastYear());
        break;
      default:
        break;
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushQuery({ search, governorate, directorate, area, period });
  }

  function clearSearch() {
    setSearch("");
    pushQuery({ search: "", governorate, directorate, area, period });
  }

  function onGovernorate(value: string) {
    setGovernorate(value);
    setDirectorate("");
    setArea("");
    pushQuery({
      search,
      governorate: value,
      directorate: "",
      area: "",
      period,
    });
  }

  function onDirectorate(value: string) {
    setDirectorate(value);
    setArea("");
    pushQuery({ search, governorate, directorate: value, area: "", period });
  }

  function onArea(value: string) {
    setArea(value);
    pushQuery({ search, governorate, directorate, area: value, period });
  }

  function onPeriod(value: Period) {
    setPeriod(value);
    pushQuery({ search, governorate, directorate, area, period: value });
  }

  function reset() {
    setSearch("");
    setGovernorate("");
    setDirectorate("");
    setArea("");
    setPeriod("all");
    startTransition(() => router.push("/"));
  }

  const hasActiveFilters =
    !!search || !!governorate || !!directorate || !!area || period !== "all";

  return (
    <div className={styles.wrap}>
      <form className={styles.searchForm} onSubmit={onSearchSubmit}>
        <span className={styles.searchIcon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="ابحث في القرارات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="بحث"
        />
        {search && (
          <button
            type="button"
            className={styles.clearSearch}
            onClick={clearSearch}
            aria-label="مسح البحث"
          >
            <CloseIcon />
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          بحث
        </button>
      </form>

      <div className={styles.filters}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="f-governorate">
            المحافظة
          </label>
          <select
            id="f-governorate"
            className={styles.select}
            value={governorate}
            onChange={(e) => onGovernorate(e.target.value)}
          >
            <option value="">اختر المحافظة</option>
            {GOVERNORATE_NAMES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="f-directorate">
            المديرية
          </label>
          <select
            id="f-directorate"
            className={styles.select}
            value={directorate}
            onChange={(e) => onDirectorate(e.target.value)}
            disabled={!governorate}
          >
            <option value="">اختر المديرية</option>
            {directorates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="f-area">
            الناحية / المنطقة
          </label>
          <select
            id="f-area"
            className={styles.select}
            value={area}
            onChange={(e) => onArea(e.target.value)}
            disabled={!directorate}
          >
            <option value="">اختر الناحية/المنطقة</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="f-period">
            الفترة الزمنية
          </label>
          <select
            id="f-period"
            className={styles.select}
            value={period}
            onChange={(e) => onPeriod(e.target.value as Period)}
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className={styles.resetRow}>
          <button type="button" className={styles.reset} onClick={reset}>
            إعادة تعيين عوامل التصفية
          </button>
        </div>
      )}
    </div>
  );
}
