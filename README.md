# 最終成果物（動作デモ）
こちらのURLからアプリケーションを確認できます: [公開URL] (https://mayumi-sasaki.github.io/maplibre-demo-kadai/)

# アプリ概要
React + TypeScript + MapLibre GL JS を用いた、背景地図の切り替えを行える、WEBアプリケーション

# 起動方法
1. 依存関係のインストール(package.jsonにmaplibre-gl記載済)

   ``bash``

   `npm install`

2. ベースマップ設定ファイル（public/basemaps.json）の存在確認

3. MapLibreのコントロールの読込記述を確認（src/MapView.tsxに以下の記述があるか）
   
    import "maplibre-gl/dist/maplibre-gl.css";

4. アプリケーションのビルドと起動

    ``bash``

    `npm start` 

5. アプリケーションの確認

    4.でブラウザが起動しアプリケーションが確認できます。開かない場合は http://localhost:3000 にアクセスすると、アプリケーションが確認可能です。
    - 全画面で地図が表示されるか。
    - 画面右上にベースマップ切り替え用のセレクトボックスが表示されているか。
    - セレクトボックスで地図を切り替えたときに、地図の内容が変更されるか。

    以上が確認できれば、アプリケーションは正常に起動しています。

# 使用技術
1. MapLibre GL JS

   地図の描画

2. React / TypeScript

   アプリケーション構築と言語

# 工夫した点
1. Mapインスタンスのライフサイクル管理

    MapLibreはDOMを直接操作するため、Reactの管理外になりやすいと考えました。
    MapLibreのMapインスタンスをReactの useRef で保持し、コンポーネントのマウント時（生成）とアンマウント時（破棄）にmap.remove() を実行することで、DOM要素とメモリリークの発生を防止しました。

2. 動的なベースマップ切り替えロジック

    外部の basemaps.json ファイルから非同期で地図タイル情報を取得し、ユーザーがセレクトボックスを操作する際、MapLibreのmap.setStyle() メソッドを使って地図を再描画せずにスタイルを更新するよう、実装しました。

3. MapView.tsxへの描画実装の集中

    描画やMapLibre GL JSの初期化など、地図に関するすべてのロジックを MapView.tsx コンポーネントに集中させました。これにより、アプリケーションの他の部分から地図実装を分離し、保守性と見通しの向上を図りました。



