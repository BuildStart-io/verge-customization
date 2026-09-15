const fs = require('fs');
const file = 'frontend/src/pages/Products.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Interface
code = code.replace(
  'video_url: string | null;',
  'video_url: string | null;\n  size_chart_url: string | null;'
);

// 2. Form state
code = code.replace(
  'const [images, setImages] = useState<string[]>([]);',
  'const [images, setImages] = useState<string[]>([]);\n  const [sizeChartUrl, setSizeChartUrl] = useState<string | null>(null);'
);

// 3. resetForm
code = code.replace(
  'setImages([]);',
  'setImages([]);\n    setSizeChartUrl(null);'
);

// 4. openEditDialog
code = code.replace(
  'setImages(product.images || []);',
  'setImages(product.images || []);\n    setSizeChartUrl(product.size_chart_url || null);'
);

// 5. handleSave payload
code = code.replace(
  'images,',
  'images,\n          size_chart_url: sizeChartUrl,'
);

// 6. UI insertion
const uiTarget = `<ProductVideoUpload
                    currentVideoUrl={videoUrl}
                    onChange={setVideoUrl}
                  />`;
const uiReplacement = `<ProductVideoUpload
                    currentVideoUrl={videoUrl}
                    onChange={setVideoUrl}
                  />

                  <div className="space-y-3 pt-2 border-t mt-4">
                    <Label className="text-sm font-semibold">Size Chart Image (optional)</Label>
                    <p className="text-xs text-muted-foreground">Upload a size chart for this product</p>
                    <ProductImageUpload
                      images={sizeChartUrl ? [sizeChartUrl] : []}
                      onChange={(urls) => setSizeChartUrl(urls[0] || null)}
                      maxImages={1}
                    />
                  </div>`;
code = code.replace(uiTarget, uiReplacement);

fs.writeFileSync(file, code);
console.log('Patched Products.tsx');
