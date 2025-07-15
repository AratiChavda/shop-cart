export const KeyValuePair = ({ label, value }: any) => (
  <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <span className="text-sm text-gray-900 font-semibold truncate">
      {value}
    </span>
  </div>
);
