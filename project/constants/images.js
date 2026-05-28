export const Images = {
  background: require('@/assets/images/background.png'),
  logo: require('@/assets/images/logo.png'),
  glowCleanser: require('@/assets/images/glow cleanser.jpeg'),
  pureFoamCleanser: require('@/assets/images/pure foam cleanser.jpeg'),
  overnightCream: require('@/assets/images/overnight cream.jpeg'),
  hydraMilkCleanser: require('@/assets/images/hydra milk cleanser.jpeg'),
  cloudBarrierCream: require('@/assets/images/cloud barrier cream.jpeg'),
  matchaDewCream: require('@/assets/images/matcha dew cream.jpeg'),
  vitamincSerum: require('@/assets/images/vitamin c serum.jpeg'),
  glassSkinSerum: require('@/assets/images/glass skin serum.jpeg'),
  sunveil: require('@/assets/images/sunveil.jpeg'),
  matchaShampoo: require('@/assets/images/matcha shampoo.jpeg'),
  matchaConditioner: require('@/assets/images/matcha conditioner.jpeg'),
  keratinHairMask: require('@/assets/images/Keratin Hair Mask.jpeg'),
  frizzControlSerum: require('@/assets/images/frizz control serum.jpeg'),
  oilControlGelCleanser: require('@/assets/images/oil control gel cleanser.jpeg'),
  salicylicAcneCleanser: require('@/assets/images/salicylic acne cleanser.jpeg'),
  teaTreeCleanser: require('@/assets/images/tea tree anti acne cleanser.jpeg'),
  calmSkinGentleCleanser: require('@/assets/images/calm skin gentle cleanser.jpeg'),
  barrierRepairCleanser: require('@/assets/images/barrier repair cleanser.jpeg'),
  niacinamideSerum: require('@/assets/images/niacinamide oil control serum.jpeg'),
  sebumBalanceSerum: require('@/assets/images/sebum balance serum.jpeg'),
  salicylicAcneTreatmentSerum: require('@/assets/images/salicylic acne treatment serum.jpeg'),
  teaTreeSerum: require('@/assets/images/tea tree healing serum.jpeg'),
  retinolSerum: require('@/assets/images/retinol serum.jpeg'),
  youthRepairSerum: require('@/assets/images/youth repair serum.jpeg'),
  hyaluronicAcidHydrationSerum: require('@/assets/images/hyaluronic acid hydration serum.jpeg'),
  nightCream: require('@/assets/images/night cream.jpeg'),
  spfHydratingCream: require('@/assets/images/spf hydrating cream.jpeg'),
  glowProtectCream: require('@/assets/images/glow protect cream.jpeg'),
  acneSunscreen: require('@/assets/images/acne sunscreen.jpeg'),
  coconutShampoo: require('@/assets/images/coconut shampoo.jpeg'),
  coconutConditioner: require('@/assets/images/coconut conditioner.jpeg'),
  keratinShampoo: require('@/assets/images/keratin shampoo.jpeg'),
  smoothShampoo: require('@/assets/images/smooth shampoo.jpeg'),
  repairBoostSerum: require('@/assets/images/repair boost serum.jpeg'),
  hydralockSerum: require('@/assets/images/hydra lock serum.jpeg'),
  silkMask: require('@/assets/images/silk mask.jpeg'),
  volumeMask: require('@/assets/images/volume mask.jpeg'),
  curlShampoo: require('@/assets/images/curl shampoo.jpeg'),
  curlConditioner: require('@/assets/images/curl conditioner.jpeg'),
  hairGrowthSerum: require('@/assets/images/hair growth serum.jpeg'),
  overnightRepairCream: require('@/assets/images/overnight repair cream.jpeg'),
};

export const PRODUCT_IMAGE_FILES = [
  'glow cleanser.jpeg',
  'pure foam cleanser.jpeg',
  'overnight cream.jpeg',
  'hydra milk cleanser.jpeg',
  'cloud barrier cream.jpeg',
  'matcha dew cream.jpeg',
  'vitamin c serum.jpeg',
  'glass skin serum.jpeg',
  'sunveil.jpeg',
  'matcha shampoo.jpeg',
  'matcha conditioner.jpeg',
  'Keratin Hair Mask.jpeg',
  'frizz control serum.jpeg',
  'oil control gel cleanser.jpeg',
  'salicylic acne cleanser.jpeg',
  'tea tree anti acne cleanser.jpeg',
  'calm skin gentle cleanser.jpeg',
  'barrier repair cleanser.jpeg',
  'niacinamide oil control serum.jpeg',
  'sebum balance serum.jpeg',
  'salicylic acne treatment serum.jpeg',
  'tea tree healing serum.jpeg',
  'retinol serum.jpeg',
  'youth repair serum.jpeg',
  'hyaluronic acid hydration serum.jpeg',
  'night cream.jpeg',
  'spf hydrating cream.jpeg',
  'glow protect cream.jpeg',
  'acne sunscreen.jpeg',
  'coconut shampoo.jpeg',
  'coconut conditioner.jpeg',
  'keratin shampoo.jpeg',
  'smooth shampoo.jpeg',
  'repair boost serum.jpeg',
  'hydra lock serum.jpeg',
  'silk mask.jpeg',
  'volume mask.jpeg',
  'curl shampoo.jpeg',
  'curl conditioner.jpeg',
  'hair growth serum.jpeg',
  'overnight repair cream.jpeg',
];

export const resolveImage = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return imagePath;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return { uri: imagePath };
  }
  const pathLower = imagePath.toLowerCase();
  if (pathLower.includes('glow cleanser')) return Images.glowCleanser;
  if (pathLower.includes('pure foam cleanser')) return Images.pureFoamCleanser;
  if (pathLower.includes('overnight repair cream')) return Images.overnightRepairCream;
  if (pathLower.includes('overnight cream')) return Images.overnightCream;
  if (pathLower.includes('hydra milk cleanser')) return Images.hydraMilkCleanser;
  if (pathLower.includes('cloud barrier cream')) return Images.cloudBarrierCream;
  if (pathLower.includes('matcha dew cream')) return Images.matchaDewCream;
  if (pathLower.includes('vitamin c serum')) return Images.vitamincSerum;
  if (pathLower.includes('glass skin serum')) return Images.glassSkinSerum;
  if (pathLower.includes('sunveil')) return Images.sunveil;
  if (pathLower.includes('matcha shampoo')) return Images.matchaShampoo;
  if (pathLower.includes('matcha conditioner')) return Images.matchaConditioner;
  if (pathLower.includes('keratin hair mask')) return Images.keratinHairMask;
  if (pathLower.includes('frizz control serum')) return Images.frizzControlSerum;
  if (pathLower.includes('oil control gel cleanser')) return Images.oilControlGelCleanser;
  if (pathLower.includes('salicylic acne treatment serum')) return Images.salicylicAcneTreatmentSerum;
  if (pathLower.includes('salicylic acne cleanser')) return Images.salicylicAcneCleanser;
  if (pathLower.includes('tea tree anti acne cleanser')) return Images.teaTreeCleanser;
  if (pathLower.includes('calm skin gentle cleanser')) return Images.calmSkinGentleCleanser;
  if (pathLower.includes('barrier repair cleanser')) return Images.barrierRepairCleanser;
  if (pathLower.includes('niacinamide oil control serum')) return Images.niacinamideSerum;
  if (pathLower.includes('sebum balance serum')) return Images.sebumBalanceSerum;
  if (pathLower.includes('tea tree healing serum')) return Images.teaTreeSerum;
  if (pathLower.includes('retinol serum')) return Images.retinolSerum;
  if (pathLower.includes('youth repair serum')) return Images.youthRepairSerum;
  if (pathLower.includes('hyaluronic acid hydration serum')) return Images.hyaluronicAcidHydrationSerum;
  if (pathLower.includes('night cream')) return Images.nightCream;
  if (pathLower.includes('spf hydrating cream')) return Images.spfHydratingCream;
  if (pathLower.includes('glow protect cream')) return Images.glowProtectCream;
  if (pathLower.includes('acne sunscreen')) return Images.acneSunscreen;
  if (pathLower.includes('coconut shampoo')) return Images.coconutShampoo;
  if (pathLower.includes('coconut conditioner')) return Images.coconutConditioner;
  if (pathLower.includes('keratin shampoo')) return Images.keratinShampoo;
  if (pathLower.includes('smooth shampoo')) return Images.smoothShampoo;
  if (pathLower.includes('repair boost serum')) return Images.repairBoostSerum;
  if (pathLower.includes('hydra lock serum')) return Images.hydralockSerum;
  if (pathLower.includes('silk mask')) return Images.silkMask;
  if (pathLower.includes('volume mask')) return Images.volumeMask;
  if (pathLower.includes('curl shampoo')) return Images.curlShampoo;
  if (pathLower.includes('curl conditioner')) return Images.curlConditioner;
  if (pathLower.includes('hair growth serum')) return Images.hairGrowthSerum;
  return { uri: imagePath };
};
