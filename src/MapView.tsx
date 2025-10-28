import React, { useRef, useEffect, useState } from "react";
import maplibregl, { StyleSpecification } from "maplibre-gl"; // ★ StyleSpecification をインポート
import "maplibre-gl/dist/maplibre-gl.css"; //地図のスタイル（コントロールなど）を正しく表示するためのCSS

// styleUrlを持つ項目もあるため、型を柔軟に定義
type Basemap = {
  id: string;
  name: string;
  type: 'raster' | 'style'; // typeは限定
  url?: string;             // ラスタの場合のみ
  styleUrl?: string;        // スタイルURLの場合のみ
  attribution?: string;
};

// Mapの状態を管理するための型
type MapState = {
    id: string;
    // MapLibreのスタイルは string (URL) または StyleSpecification オブジェクト
    style: string | StyleSpecification; // 型を StyleSpecification に変更
    attribution?: string;
}

const MapView: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [basemaps, setBasemaps] = useState<Record<string, Basemap>>({});
  // currentMapStateオブジェクトに現在のベースマップの全情報を保持
  const [currentMapState, setCurrentMapState] = useState<MapState | null>(null);

  // ----------------------------------------------------
  // 1. basemaps.jsonを読み込み、初期のスタイルを設定
  // ----------------------------------------------------
  useEffect(() => {
    fetch("/basemaps.json") // アプリのルートパスから直接アクセスできる
      .then((res) => {
        // 念のため、レスポンスがOK（200番台）か確認する
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      //basemaps.jsonのbasemaps配列を取得
      .then((data) => {
        const basemapsArray: Basemap[] = data.basemaps;
        // idに対応するbasemapsObject全て取得。特定のIDのベースマップ情報を取得したい場合、basemaps["osm"]で取得可能になる。
        // acc(最初は空。処理中に構築されるオブジェクト), bm(個別のbasemapsArrayオブジェクト)
        // basemapObject完成形{ "gsi-standard": { "id": "gsi-standard", "name": "GSI 標準地図", ... },  "osm": { "id": "osm", "name": "OpenStreetMap", ... }}
        const basemapsObject: Record<string, Basemap> = basemapsArray.reduce(
            (acc, bm) => {
                acc[bm.id] = bm;
                return acc;
            }, {} as Record<string, Basemap>
        );
        setBasemaps(basemapsObject);

        // defaultIdに基づいて初期マップを設定
        const defaultBasemap = basemapsObject[data.defaultId];
        if (defaultBasemap) {
            handleChangeBasemap(defaultBasemap);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch basemaps:", error);
      });
  }, []);
  
  // ----------------------------------------------------
  // 2. Mapのスタイルを切り替える関数
  // ----------------------------------------------------
  const handleChangeBasemap = (selectedBasemap: Basemap) => {
    // string (URL) または StyleSpecification の型で初期化
    let styleToSet: string | StyleSpecification; 

    if (selectedBasemap.type === "raster") {
      // ラスタタイルの場合: MapLibreのカスタムスタイルオブジェクトを生成
      const rasterStyle: StyleSpecification = { // ★ 明示的に StyleSpecification 型を宣言
        version: 8,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: [selectedBasemap.url!],
            tileSize: 256,
            attribution: selectedBasemap.attribution || "",
          } as maplibregl.RasterSourceSpecification, // Sourceの型も明示
        },
        layers: [
          {
            id: "base-layer",
            type: "raster",
            source: "raster-tiles",
          } as maplibregl.RasterLayerSpecification, // Layerの型も明示
        ],
      };
      styleToSet = rasterStyle;
    } else {
      // styleタイプの場合: styleUrlを直接設定
      styleToSet = selectedBasemap.styleUrl!;
    }

    setCurrentMapState({
        id: selectedBasemap.id,
        style: styleToSet,
        attribution: selectedBasemap.attribution
    });
  };

  // セレクトボックス変更時のハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedBasemap = basemaps[selectedId];
    if (selectedBasemap) {
        handleChangeBasemap(selectedBasemap);
    }
  };

  // ----------------------------------------------------
  // 3. Mapの初期化・再初期化（クリーンアップ含む）
  // ----------------------------------------------------
  useEffect(() => {
    // スタイル情報がない、またはコンテナがない場合は処理しない
    if (!mapContainer.current || !currentMapState) return;

    // 既存のマップがあれば破棄して作り直す
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Mapインスタンスの作成
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: currentMapState.style, // ★ MapLibreスタイルURLまたはカスタムスタイルオブジェクト
      center: [140.8694, 38.2682], // 仙台付近に設定
      zoom: 12,
    });

    // コントロールの追加
    map.addControl(new maplibregl.NavigationControl(), "top-left");

    // Mapインスタンスをrefに保存
    mapInstance.current = map;

    // クリーンアップ関数
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [currentMapState]); // currentMapStateが変更されたときにMapを再初期化

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* セレクトボックスをMapの上に配置 */}
      <div style={{ 
          position: "absolute", 
          top: 10,    // 上
          right: 10,  // 右
          zIndex: 10, // マップより手前に表示
          backgroundColor: 'white',
          padding: '5px',
          borderRadius: '4px'
      }}>
        <select 
            id="select-demo"
            onChange={handleChange} 
            value={currentMapState?.id || ""}
        >
          {Object.values(basemaps).map((bm) => ( // mapメソッドでbasemapのidをkey,valueに入れ、nameをselect要素に表示
            <option key={bm.id} value={bm.id}>
              {bm.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mapコンテナ */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* 著作権表示（MapLibreのAttributionControlを無効化している場合に使用） */}
      {currentMapState?.attribution && (
          <div 
              style={{ 
                  position: "absolute", 
                  bottom: 10, 
                  right: 10, 
                  zIndex: 10, 
                  fontSize: '0.8em',
                  color: '#333',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  maxWidth: 'calc(100% - 20px)' // 横幅がはみ出さないように
              }}
              // ★★★ HTML文字列をそのまま描画する ★★★
              dangerouslySetInnerHTML={{ __html: currentMapState.attribution }}
          />
      )}
    </div>
  );
};

export default MapView;
