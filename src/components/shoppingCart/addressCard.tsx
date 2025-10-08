import { addressBadgeColors } from "@/constant/common";
import { Mail, Phone } from "lucide-react";

export const AddressCard = ({
  address,
  showIcons = true,
  isSelected = false,
  onClick,
}: {
  address: any;
  showIcons?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  const badgeClass =
    addressBadgeColors[address.addressType?.toLowerCase()] ||
    addressBadgeColors.other;

  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer shadow-sm bg-white
        ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-primary/40"
        }
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-base font-semibold text-gray-800">
          {address.firstName}{" "}
          {address.middleInitial ? `${address.middleInitial} ` : ""}
          {address.lastName}
        </h4>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass}`}
        >
          {address.addressType}
        </span>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        {address.addressLine3 && <p>{address.addressLine3}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
      </div>

      {(address.phone || address.email) && (
        <div className="pt-3 mt-3 border-t border-gray-200 text-sm text-muted-foreground space-y-1">
          {address.phone && (
            <p className="flex items-center gap-2">
              {showIcons && <Phone className="h-4 w-4" />}
              {address.phone}
            </p>
          )}
          {address.email && (
            <p className="flex items-center gap-2">
              {showIcons && <Mail className="h-4 w-4" />}
              {address.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
