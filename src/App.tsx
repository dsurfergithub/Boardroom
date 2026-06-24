/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BoardroomProvider } from './context';
import { MainLayout } from './components/MainLayout';
import { AuthGate } from './components/AuthGate';
import { getGeminiKey } from './lib/auth';

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => !!getGeminiKey());

  if (!authenticated) {
    return <AuthGate onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <BoardroomProvider>
      <MainLayout />
    </BoardroomProvider>
  );
}
