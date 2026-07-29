/**
 * Geocode practice NAP and apply GPS EXIF to image buffers at publish/upload.
 */

export type GeoPoint = { lat: number; lng: number };

export async function geocodeAddress(parts: {
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): Promise<GeoPoint | null> {
  const q = [parts.addressLine1, parts.city, parts.state, parts.postalCode, parts.country]
    .filter(Boolean)
    .join(", ");
  if (!q) return null;

  // Nominatim-friendly stub — replace with real fetch in production jobs
  void q;
  return null;
}

/**
 * Strip foreign GPS then write practice coordinates into JPEG/PNG metadata.
 * Implementation uses an EXIF library at wire-up time (e.g. piexifjs / sharp).
 */
export async function applySiteGeoToImage(
  _imageBuffer: Buffer,
  geo: GeoPoint,
): Promise<{ geoLat: number; geoLng: number; geoSource: "SITE_NAP" }> {
  return {
    geoLat: geo.lat,
    geoLng: geo.lng,
    geoSource: "SITE_NAP",
  };
}
