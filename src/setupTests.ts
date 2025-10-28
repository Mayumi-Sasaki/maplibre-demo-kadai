// src/setupTests.ts

// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// ----------------------------------------------------
// 1. window.URL.createObjectURL のエラー回避
// ----------------------------------------------------
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn(); 

// ----------------------------------------------------
// 2. MapLibre GL JS のモック
// ----------------------------------------------------
// jest.mock() の中で使用するダミーの関数を定義
const mockMapMethod = jest.fn();
const mockControlMethod = jest.fn(() => ({})); // NavigationControlが返すオブジェクト

// maplibre-gl モジュール全体をモック化
jest.mock('maplibre-gl', () => {
  // Mapインスタンスが持つべきメソッド
  const MapInstanceMock = {
    remove: mockMapMethod,
    on: mockMapMethod,
    off: mockMapMethod,
    addControl: mockMapMethod, // ★ MapView.tsx:138 で呼び出されているメソッド
    setStyle: mockMapMethod,
    // その他、MapLibreの内部で必要なメソッドがあればここに追加
  };

  return {
    // new maplibregl.Map(...) が呼ばれたときに、上記のインスタンスを返す
    Map: jest.fn(() => MapInstanceMock), 
    
    // コントロールのモック: コンストラクタを呼び出せるようにする
    NavigationControl: mockControlMethod, // ★ NavigationControlのモック
    ScaleControl: mockControlMethod,
    AttributionControl: mockControlMethod,
    
    // 型や定数のモック
    StyleSpecification: {}, // 単なる空のオブジェクトで十分
    // 必要であれば他の定数も追加
  };
});

// ----------------------------------------------------
// 注意: MapView.test.tsx の beforeEach で mockMapMethod.mockClear() を呼び出す必要があります。
// (これはテストの再実行を確実にするため)