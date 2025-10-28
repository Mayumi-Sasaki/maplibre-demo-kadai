import React from 'react';
import { render, screen } from '@testing-library/react';
import MapView from './MapView'; // MapViewをインポート

// jest.mock(...) は setupTests.ts で設定済みを前提とします

test('renders the main application structure and the basemap selector', async () => {
  // fetchのモック設定（必要に応じて。今回は省略）
  
  render(<MapView />);

  // MapView内のセレクトボックス（ベースマップ切り替え）は
  // アクセシビリティロール 'combobox' を持つ要素しかないため、これが存在することを確認する。
  const selectElement = screen.getByRole('combobox');
  
  // 要素がDOMに存在することを確認
  expect(selectElement).toBeInTheDocument();

  // MapLibreのモックが正しく機能していることも間接的に確認できます。
  // 必要に応じて、fetchが解決し、オプションが描画されたことを確認するためにawait findByRoleを使う
  // 例: await screen.findByRole('option', { name: /GSI 標準地図/i }); 
});