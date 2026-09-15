const fs = require('fs');
const file = 'frontend/src/components/products/VariationEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. updateOption
code = code.replace(
  'field: "label" | "price",',
  'field: "label" | "price" | "imageUrl",'
);

code = code.replace(
  '    if (field === "price") {',
  `    if (field === "imageUrl") {
      option.imageUrl = value || undefined;
    } else if (field === "price") {`
);

// 2. Add an Image button in the options grid.
code = code.replace(
  'grid-cols-[20px_1fr_100px_32px_32px]',
  'grid-cols-[20px_1fr_100px_32px_32px_32px]'
);
code = code.replace(
  'grid-cols-[20px_1fr_100px_32px_32px]', // second occurrence
  'grid-cols-[20px_1fr_100px_32px_32px_32px]'
);

code = code.replace(
  '<span>Price</span>\n              <span />\n              <span />',
  '<span>Price</span>\n              <span />\n              <span />\n              <span />'
);

const importImage = `import { Image as ImageIcon } from "lucide-react";`;
if (!code.includes('ImageIcon')) {
  code = code.replace('import { useState } from "react";', `import { useState } from "react";\n${importImage}`);
}

const addSubVariantButton = `<Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Add sub-variant"
                      onClick={() => addSubVariant(varIndex, optIndex)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>`;

const newButtons = `<Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={option.imageUrl ? "Edit Image" : "Add Image"}
                      onClick={() => {
                        const key = \`image-\${varIndex}-\${optIndex}\`;
                        setExpandedOptions(prev => ({ ...prev, [key]: !prev[key] }));
                      }}
                    >
                      <ImageIcon className={\`h-3 w-3 \${option.imageUrl ? "text-primary" : ""}\`} />
                    </Button>
                    ${addSubVariantButton}`;

code = code.replace(addSubVariantButton, newButtons);

const expandedImageUpload = `                  {expandedOptions[\`image-\${varIndex}-\${optIndex}\`] && (
                    <div className="ml-7 p-3 bg-muted/20 rounded border border-dashed">
                      <ProductImageUpload
                        label={null}
                        images={option.imageUrl ? [option.imageUrl] : []}
                        onChange={(urls) => updateOption(varIndex, optIndex, "imageUrl", urls[0] || "")}
                        maxImages={1}
                      />
                    </div>
                  )}

                  {/* Sub-variants */}`;

code = code.replace('{/* Sub-variants */}', expandedImageUpload);

fs.writeFileSync(file, code);
