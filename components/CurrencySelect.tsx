import { useState, useMemo, useRef, useEffect } from "react";

const currencies = [
  { country: "United States", value: "USD" },
  { country: "India", value: "INR" },
  { country: "United Kingdom", value: "GBP" },
  { country: "European Union", value: "EUR" },
  { country: "Japan", value: "JPY" },
  { country: "Canada", value: "CAD" },
  { country: "Australia", value: "AUD" },
  { country: "Switzerland", value: "CHF" },
  { country: "China", value: "CNY" },
  { country: "Singapore", value: "SGD" },
  { country: "Hong Kong", value: "HKD" },
  { country: "New Zealand", value: "NZD" },
  { country: "Sweden", value: "SEK" },
  { country: "South Korea", value: "KRW" },
  { country: "Norway", value: "NOK" },
  { country: "Mexico", value: "MXN" },
  { country: "Brazil", value: "BRL" },
  { country: "South Africa", value: "ZAR" },
  { country: "Russia", value: "RUB" },
  { country: "UAE", value: "AED" },
  { country: "Saudi Arabia", value: "SAR" },
  { country: "Thailand", value: "THB" },
  { country: "Malaysia", value: "MYR" },
  { country: "Indonesia", value: "IDR" },
  { country: "Philippines", value: "PHP" },
  { country: "Vietnam", value: "VND" },
  { country: "Poland", value: "PLN" },
  { country: "Turkey", value: "TRY" },
  { country: "Denmark", value: "DKK" },
  { country: "Israel", value: "ILS" },
];

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  className?: string;
}

export default function CurrencySelect({
  value,
  onChange,
  name = "currency",
  id = "currency",
  className = "",
}: CurrencySelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCurrencies = useMemo(() => {
    if (!search) return currencies;
    const searchLower = search.toLowerCase();
    return currencies.filter(
      (c) =>
        c.country.toLowerCase().includes(searchLower) ||
        c.value.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = (currencyValue: string) => {
    onChange(currencyValue);
    setIsOpen(false);
    setSearch("");
  };

  const selectedCurrency = currencies.find((c) => c.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {selectedCurrency ? (
          <span>
            {selectedCurrency.country} ({selectedCurrency.value})
          </span>
        ) : (
          <span className="text-gray-400">Select currency</span>
        )}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search country or currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.value}
                  type="button"
                  onClick={() => handleSelect(currency.value)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    value === currency.value ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  {currency.country} ({currency.value})
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                No currency found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export currencies array for use in other components
export { currencies };
