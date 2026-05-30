import fs from 'fs';
import path from 'path';

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.expo', '.git', 'scripts'].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(tsx?)$/.test(ent.name) && !ent.name.endsWith('.d.ts')) acc.push(p);
  }
  return acc;
}

function convert(content) {
  let s = content;
  s = s.replace(/^import type \{[^}]+\} from ['"][^'"]+['"];?\r?\n/gm, '');
  s = s.replace(/^import type [^\n]+;\r?\n/gm, '');
  s = s.replace(/import \{([^}]+)\} from '@\/types';/g, (m, g) => {
    const parts = g.split(',').map((x) => x.trim());
    const runtime = parts.filter((x) => {
      const name = x.replace(/\s+as\s+.*/, '').trim();
      return name && name === name.toUpperCase() && name.includes('_');
    });
    if (!runtime.length) return '';
    return `import { ${runtime.join(', ')} } from '@/types';`;
  });
  s = s.replace(/, type [A-Za-z]+/g, '');
  s = s.replace(/export type [^;]+;/g, '');
  s = s.replace(/^export interface[\s\S]*?^}\r?\n/gm, '');
  s = s.replace(/^interface[\s\S]*?^}\r?\n/gm, '');
  s = s.replace(/^type [A-Za-z]+ = [^;]+;\r?\n/gm, '');
  s = s.replace(/useState<[^>]+>/g, 'useState');
  s = s.replace(/useMemo<[^>]+>/g, 'useMemo');
  s = s.replace(/loadJson<[^>]+>/g, 'loadJson');
  s = s.replace(/createContext<[^>]+>/g, 'createContext');
  s = s.replace(/:\s*React\.ReactNode/g, '');
  s = s.replace(/:\s*Promise<[^>]+>/g, '');
  s = s.replace(/:\s*string(\s*\|\s*null)?/g, '');
  s = s.replace(/:\s*number/g, '');
  s = s.replace(/:\s*boolean/g, '');
  s = s.replace(/:\s*User(\s*\|\s*null)?/g, '');
  s = s.replace(/:\s*Product(\s*\|\s*undefined)?/g, '');
  s = s.replace(/:\s*Order(\s*\|\s*null)?/g, '');
  s = s.replace(/:\s*Order\['status'\]/g, '');
  s = s.replace(/:\s*Partial<[^>]+>/g, '');
  s = s.replace(/:\s*Omit<[^>]+>/g, '');
  s = s.replace(/:\s*OrderItem\[\]/g, '');
  s = s.replace(/:\s*User\[\]/g, '');
  s = s.replace(/:\s*Product\[\]/g, '');
  s = s.replace(/:\s*Order\[\]/g, '');
  s = s.replace(/:\s*CartItem\[\]/g, '');
  s = s.replace(/:\s*ProductCategory(\s*\|\s*'all')?/g, '');
  s = s.replace(/:\s*FilterCategory/g, '');
  s = s.replace(/:\s*Variant/g, '');
  s = s.replace(/:\s*TouchableOpacityProps/g, '');
  s = s.replace(/:\s*TextInputProps/g, '');
  s = s.replace(/:\s*ViewProps/g, '');
  s = s.replace(/:\s*StyleProp<ViewStyle>/g, '');
  s = s.replace(/:\s*ViewStyle/g, '');
  s = s.replace(/:\s*TextStyle/g, '');
  s = s.replace(/:\s*OrderStatus/g, '');
  s = s.replace(/:\s*BottomTabBarButtonProps/g, '');
  s = s.replace(/:\s*ColorScheme/g, '');
  s = s.replace(/:\s*IconSymbolName/g, '');
  s = s.replace(/\(i\): i is OrderItem =>/g, '(i) =>');
  s = s.replace(/ as const/g, '');
  s = s.replace(/ satisfies [^\n]+/g, '');
  s = s.replace(/ as Href/g, '');
  s = s.replace(/ as Parameters<typeof router\.push>\[0\]/g, '');
  s = s.replace(/ as never/g, '');
  s = s.replace(/\{ id \}: \{ id: string \}/g, '{ id }');
  s = s.replace(/\{ id\?: string \}/g, '{ id }');
  s = s.replace(/keyof typeof Ionicons\.glyphMap/g, 'string');
  s = s.replace(/DEFAULT_USERS: User\[\]/g, 'DEFAULT_USERS');
  s = s.replace(/let registrationError: string \| null = null/g, 'let registrationError = null');
  s = s.replace(/const newUser: User =/g, 'const newUser =');
  s = s.replace(/const newProduct: Product =/g, 'const newProduct =');
  s = s.replace(/const order: Order =/g, 'const order =');
  s = s.replace(/const items: OrderItem\[\] =/g, 'const items =');
  s = s.replace(/: AppContextValue \| null/g, '');
  s = s.replace(/import \{ Product \} from '@\/types';\r?\n/g, '');
  s = s.replace(/import \{[^}]*ProductCategory[^}]*\} from '@\/types';\r?\n/g, '');
  s = s.replace(/import \{[^}]*OrderStatus[^}]*\} from '@\/types';\r?\n/g, '');
  s = s.replace(/import \{[^}]*Product[^}]*\} from '@\/types';\r?\n/g, (m) =>
    m.includes('CATEGORY') ? m : ''
  );
  s = s.replace(/import \{ CartItem, Order, OrderItem, Product, User \} from '@\/types';\r?\n/g, '');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s;
}

const root = process.cwd();
const files = walk(root);
for (const file of files) {
  const ext = file.endsWith('.tsx') ? '.jsx' : '.js';
  const out = file.replace(/\.tsx?$/, ext);
  const content = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(out, convert(content));
  fs.unlinkSync(file);
  console.log(`${path.relative(root, file)} -> ${path.relative(root, out)}`);
}
