/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoardroomProvider } from './context';
import { MainLayout } from './components/MainLayout';

export default function App() {
  return (
    <BoardroomProvider>
      <MainLayout />
    </BoardroomProvider>
  );
}
