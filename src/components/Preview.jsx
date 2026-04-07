import CVPreview from './CVPreview';

export default function Preview() {
  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">ATS Live Preview</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <CVPreview />
      </div>
    </div>
  );
}
