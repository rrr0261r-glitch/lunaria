/**
 * 出生地の自由入力(英語/日本語どちらも可)を緯度経度に変換する。
 * OpenStreetMap Nominatim を使用(無料・APIキー不要)。
 *
 * 利用規約上、検索リクエストは過度に連発しないこと
 * (このLUNARIAの用途=オンボーディング時に数回、なら全く問題ない範囲)。
 */

export interface GeocodingResult {
  displayName: string; // "Tokyo, Japan" のような表示用の正式名称
  lat: number;
  lon: number;
  countryCode: string; // "jp", "us" など
}

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

/**
 * 場所の名前(自由入力)から候補地を検索する。
 * 入力は日本語/英語どちらでも検索可能(Nominatimが多言語対応のため)。
 */
export async function searchPlace(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), {
    headers: {
      // Nominatim の利用規約上、User-Agent の指定が推奨される
      'User-Agent': 'LUNARIA-App/1.0',
    },
  });

  if (!res.ok) return [];

  const data = await res.json();

  return data.map((item: any) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    countryCode: item.address?.country_code ?? '',
  }));
}