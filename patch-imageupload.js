const fs = require('fs');
const file = 'frontend/src/components/products/ProductImageUpload.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'maxImages: number;',
  'maxImages: number;\n  label?: React.ReactNode | null;'
);

code = code.replace(
  'export default function ProductImageUpload({ images, onChange, maxImages }: ProductImageUploadProps) {',
  'export default function ProductImageUpload({ images, onChange, maxImages, label }: ProductImageUploadProps) {'
);

const oldLabel = `<div className="flex items-center justify-between">
        <Label>Product Images</Label>
        <span className="text-xs text-muted-foreground">
          {images.length}/{maxImages}
        </span>
      </div>`;
const newLabel = `{label !== null && (
        <div className="flex items-center justify-between">
          <Label>{label || "Product Images"}</Label>
          <span className="text-xs text-muted-foreground">
            {images.length}/{maxImages}
          </span>
        </div>
      )}`;

code = code.replace(oldLabel, newLabel);

fs.writeFileSync(file, code);
