/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AppState, TabType, GroupType, Player, ActiveMatch } from './types.ts';
import { loadState, saveState, getFreshState, SAMPLE_PLAYERS } from './utils/storage.ts';
import { findMatch, getPresentPlayers, getBusySet, getMinTurns } from './utils/drawLogic.ts';
import { Header } from './components/Header.tsx';
import { Navigation } from './components/Navigation.tsx';
import { CourtsTab } from './components/CourtsTab.tsx';
import { PlayersTab } from './components/PlayersTab.tsx';
import { RankTab } from './components/RankTab.tsx';
import { HistoryTab } from './components/HistoryTab.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ConfirmModal } from './components/ConfirmModal.tsx';
import { Toast } from './components/Toast.tsx';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [rollingCourts, setRollingCourts] = useState<Set<number>>(new Set());
  const [rollingNames, setRollingNames] = useState<Record<number, { t1: string[]; t2: string[] }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    confirmLabel: 'Xác nhận',
    onConfirm: () => {},
  });

  const toastTimerRef = useRef<number | null>(null);

  // Auto save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const showToast = (msg: string, duration = 2800) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  const getPlayerName = (id: number): string => {
    const p = state.players.find((pl) => pl.id === id);
    return p ? p.name : '(Đã xóa)';
  };

  // Helper to trigger slot machine roll animation
  const triggerRollAnimation = (
    courtIndices: number[],
    preparedMatches: { court: number; t1: [number, number]; t2: [number, number]; id: number }[]
  ) => {
    const present = getPresentPlayers(state.players);
    const namesPool = present.map((p) => p.name);
    if (!namesPool.length) return;

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch {
      // Haptics not supported or ignored
    }

    setRollingCourts(new Set(courtIndices));

    const interval = window.setInterval(() => {
      setRollingNames((prev) => {
        const next = { ...prev };
        courtIndices.forEach((c) => {
          next[c] = {
            t1: [
              namesPool[Math.floor(Math.random() * namesPool.length)],
              namesPool[Math.floor(Math.random() * namesPool.length)],
            ],
            t2: [
              namesPool[Math.floor(Math.random() * namesPool.length)],
              namesPool[Math.floor(Math.random() * namesPool.length)],
            ],
          };
        });
        return next;
      });
    }, 70);

    window.setTimeout(() => {
      window.clearInterval(interval);
      setRollingCourts(new Set());
      setRollingNames({});

      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([20, 40, 20]);
        }
      } catch {
        // Ignored
      }

      // Apply the matches to state
      setState((prev) => {
        const nextActive = { ...prev.active };
        const nextPlayers = [...prev.players];

        preparedMatches.forEach((m) => {
          nextActive[m.court] = {
            id: m.id,
            court: m.court,
            t1: m.t1,
            t2: m.t2,
            at: Date.now(),
            d1: '',
            d2: '',
          };

          [...m.t1, ...m.t2].forEach((playerId) => {
            const player = nextPlayers.find((p) => p.id === playerId);
            if (player) {
              player.turns++;
            }
          });
        });

        return {
          ...prev,
          active: nextActive,
          players: nextPlayers,
        };
      });
    }, 1100);
  };

  // Draw for a single court
  const handleDrawCourt = (courtIdx: number) => {
    if (state.active[courtIdx] || rollingCourts.has(courtIdx)) return;

    const res = findMatch(state.players, state.active, state.history, state.sameType);
    if (res.err) {
      showToast(res.err, 4000);
      return;
    }

    const matchId = state.seq + 1;
    setState((prev) => ({ ...prev, seq: prev.seq + 1 }));

    triggerRollAnimation([courtIdx], [
      {
        court: courtIdx,
        t1: res.t1!,
        t2: res.t2!,
        id: matchId,
      },
    ]);
  };

  // Draw for all available empty courts
  const handleDrawAllFree = () => {
    const freeCourts = Array.from({ length: state.courts }, (_, i) => i).filter(
      (i) => !state.active[i] && !rollingCourts.has(i)
    );

    if (!freeCourts.length) {
      showToast('Tất cả sân đều đang diễn ra trận đấu.');
      return;
    }

    // Sequentially find matches taking previous temp active into account
    let tempActive = { ...state.active };
    let tempPlayers = [...state.players];
    let tempSeq = state.seq;
    const prepared: { court: number; t1: [number, number]; t2: [number, number]; id: number }[] = [];

    for (const c of freeCourts) {
      const res = findMatch(tempPlayers, tempActive, state.history, state.sameType);
      if (res.err || !res.t1 || !res.t2) break;

      tempSeq++;
      const match: ActiveMatch = {
        id: tempSeq,
        court: c,
        t1: res.t1,
        t2: res.t2,
        at: Date.now(),
        d1: '',
        d2: '',
      };

      tempActive[c] = match;
      [...res.t1, ...res.t2].forEach((pid) => {
        const p = tempPlayers.find((x) => x.id === pid);
        if (p) p.turns++;
      });

      prepared.push({ court: c, t1: res.t1, t2: res.t2, id: tempSeq });
    }

    if (!prepared.length) {
      showToast('Không đủ người chơi hợp lệ để bốc thăm thêm sân.');
      return;
    }

    setState((prev) => ({ ...prev, seq: tempSeq }));
    triggerRollAnimation(
      prepared.map((p) => p.court),
      prepared
    );
  };

  const handleScoreChange = (courtIdx: number, team: 1 | 2, val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 2);
    setState((prev) => {
      const match = prev.active[courtIdx];
      if (!match) return prev;
      return {
        ...prev,
        active: {
          ...prev.active,
          [courtIdx]: {
            ...match,
            [team === 1 ? 'd1' : 'd2']: cleaned,
          },
        },
      };
    });
  };

  const handleQuickScore = (courtIdx: number, team: 1 | 2) => {
    setState((prev) => {
      const match = prev.active[courtIdx];
      if (!match) return prev;
      const targetKey = team === 1 ? 'd1' : 'd2';
      const otherKey = team === 1 ? 'd2' : 'd1';

      return {
        ...prev,
        active: {
          ...prev.active,
          [courtIdx]: {
            ...match,
            [targetKey]: '15',
            [otherKey]: match[otherKey] === '15' ? '' : match[otherKey],
          },
        },
      };
    });
  };

  const commitFinishMatch = (courtIdx: number) => {
    const match = state.active[courtIdx];
    if (!match) return;

    const s1 = parseInt(match.d1, 10);
    const s2 = parseInt(match.d2, 10);
    const now = Date.now();

    const winnerNames = s1 > s2 ? match.t1.map(getPlayerName).join(' & ') : match.t2.map(getPlayerName).join(' & ');
    const maxScore = Math.max(s1, s2);
    const minScore = Math.min(s1, s2);

    setState((prev) => {
      const nextActive = { ...prev.active };
      delete nextActive[courtIdx];

      const nextHistory = [
        ...prev.history,
        {
          id: match.id,
          court: courtIdx,
          t1: match.t1,
          t2: match.t2,
          s1,
          s2,
          at: match.at,
          end: now,
        },
      ];

      const nextPlayers = prev.players.map((p) => {
        if ([...match.t1, ...match.t2].includes(p.id)) {
          return { ...p, last: now };
        }
        return p;
      });

      return {
        ...prev,
        active: nextActive,
        history: nextHistory,
        players: nextPlayers,
      };
    });

    // Celebratory confetti animation
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c9a44c', '#1f3a5f', '#2f8f5b', '#f4ead2'],
      });
    } catch {
      // Ignored
    }

    showToast(`Sân ${courtIdx + 1}: ${winnerNames} thắng ${maxScore}–${minScore}! 🏆`);
  };

  const handleFinishMatch = (courtIdx: number) => {
    const match = state.active[courtIdx];
    if (!match) return;

    const s1 = parseInt(match.d1, 10);
    const s2 = parseInt(match.d2, 10);

    if (isNaN(s1) || isNaN(s2)) {
      showToast('Vui lòng nhập tỉ số của cả hai đội.');
      return;
    }

    if (s1 === s2) {
      showToast('Tỉ số trận đấu không được hòa.');
      return;
    }

    if (Math.max(s1, s2) < 15) {
      setConfirmModal({
        isOpen: true,
        message: `Chưa đội nào chạm 15 điểm (${s1}–${s2}). Bạn có chắc chắn muốn lưu kết quả này không?`,
        confirmLabel: 'Lưu kết quả',
        onConfirm: () => {
          setConfirmModal((m) => ({ ...m, isOpen: false }));
          commitFinishMatch(courtIdx);
        },
      });
    } else {
      commitFinishMatch(courtIdx);
    }
  };

  const handleCancelMatch = (courtIdx: number) => {
    setConfirmModal({
      isOpen: true,
      message: `Hủy trận ở Sân ${courtIdx + 1}? Lượt ra sân của 4 người chơi sẽ được hoàn lại để ưu tiên bốc ở lượt sau.`,
      confirmLabel: 'Hủy trận',
      isDanger: true,
      onConfirm: () => {
        const match = state.active[courtIdx];
        if (match) {
          setState((prev) => {
            const nextActive = { ...prev.active };
            delete nextActive[courtIdx];

            const nextPlayers = prev.players.map((p) => {
              if ([...match.t1, ...match.t2].includes(p.id) && p.turns > 0) {
                return { ...p, turns: p.turns - 1 };
              }
              return p;
            });

            return {
              ...prev,
              active: nextActive,
              players: nextPlayers,
            };
          });
          showToast(`Đã hủy trận ở Sân ${courtIdx + 1}.`);
        }
        setConfirmModal((m) => ({ ...m, isOpen: false }));
      },
    });
  };

  const handleAddPlayers = (names: string[], g: GroupType) => {
    const baseTurns = getMinTurns(state.players);
    let addedCount = 0;
    const duplicates: string[] = [];
    let currentSeq = state.seq;

    const newPlayers: Player[] = [];

    names.forEach((name) => {
      const exists = state.players.some(
        (p) => !p.del && p.name.trim().toLowerCase() === name.toLowerCase()
      );
      if (exists) {
        duplicates.push(name);
        return;
      }

      currentSeq++;
      newPlayers.push({
        id: currentSeq,
        name: name.trim(),
        g,
        on: true,
        turns: baseTurns,
        last: 0,
        del: false,
        isNew: Object.keys(state.active).length > 0 || state.history.length > 0,
      });
      addedCount++;
    });

    setState((prev) => ({
      ...prev,
      seq: currentSeq,
      players: [...prev.players, ...newPlayers],
    }));

    let msg = '';
    if (addedCount > 0) {
      msg = `Đã thêm ${addedCount} người vào rổ ${g === 'A' ? 'Nam A' : g === 'B' ? 'Nam B' : 'Nữ'}`;
      if (state.history.length > 0 || Object.keys(state.active).length > 0) {
        msg += ' (sẽ được ưu tiên bốc ở lượt tới).';
      } else {
        msg += '.';
      }
    }
    if (duplicates.length > 0) {
      msg += (msg ? ' ' : '') + `Trùng tên: ${duplicates.join(', ')}.`;
    }
    showToast(msg);
  };

  const handleToggleAttendance = (playerId: number) => {
    const busy = getBusySet(state.active);
    if (busy.has(playerId)) {
      showToast('Người này đang thi đấu trên sân, chưa thể cho nghỉ.');
      return;
    }

    setState((prev) => {
      const minT = getMinTurns(prev.players, playerId);
      return {
        ...prev,
        players: prev.players.map((p) => {
          if (p.id === playerId) {
            const nextOn = !p.on;
            return {
              ...p,
              on: nextOn,
              turns: nextOn ? Math.max(p.turns, minT) : p.turns,
            };
          }
          return p;
        }),
      };
    });
  };

  const handleChangePlayerGroup = (playerId: number, g: GroupType) => {
    const busy = getBusySet(state.active);
    if (busy.has(playerId)) {
      showToast('Người này đang trên sân, hãy đổi rổ sau khi kết thúc trận.');
      return;
    }

    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === playerId ? { ...p, g } : p)),
    }));
    showToast(`Đã chuyển sang rổ ${g === 'A' ? 'Nam A' : g === 'B' ? 'Nam B' : 'Nữ'}.`);
  };

  const handleDeletePlayer = (playerId: number) => {
    const busy = getBusySet(state.active);
    if (busy.has(playerId)) {
      showToast('Người này đang trên sân, chưa thể xóa.');
      return;
    }

    const player = state.players.find((p) => p.id === playerId);
    if (!player) return;

    const hasPlayed = state.history.some((h) => [...h.t1, ...h.t2].includes(playerId));

    setConfirmModal({
      isOpen: true,
      message: `Xóa ${player.name} khỏi danh sách?${
        hasPlayed ? ' Các trận đã đấu của người này vẫn sẽ được bảo lưu trong lịch sử.' : ''
      }`,
      confirmLabel: 'Xóa',
      isDanger: true,
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          players: hasPlayed
            ? prev.players.map((p) => (p.id === playerId ? { ...p, del: true, on: false } : p))
            : prev.players.filter((p) => p.id !== playerId),
        }));
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        showToast(`Đã xóa ${player.name}.`);
      },
    });
  };

  const handleDeleteMatch = (matchId: number) => {
    setConfirmModal({
      isOpen: true,
      message: 'Xóa kết quả trận đấu này? Bảng xếp hạng và chỉ số sẽ được tính toán lại.',
      confirmLabel: 'Xóa trận',
      isDanger: true,
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          history: prev.history.filter((h) => h.id !== matchId),
        }));
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        showToast('Đã xóa trận đấu.');
      },
    });
  };

  const handleNewSession = () => {
    setConfirmModal({
      isOpen: true,
      message: 'Bắt đầu ván mới? Toàn bộ danh sách người chơi sẽ được giữ nguyên, xóa toàn bộ các trận đấu và kết quả.',
      confirmLabel: 'Ván mới',
      isDanger: true,
      onConfirm: () => {
        setState((prev) => ({
          ...prev,
          history: [],
          active: {},
          tab: 'courts',
          players: prev.players
            .filter((p) => !p.del)
            .map((p) => ({ ...p, turns: 0, last: 0, isNew: false })),
        }));
        setIsSettingsOpen(false);
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        showToast('Đã khởi tạo ván mới thành công!');
      },
    });
  };

  const handleWipeData = () => {
    setConfirmModal({
      isOpen: true,
      message: 'Xóa toàn bộ người chơi và kết quả? Hành động này sẽ làm trống hoàn toàn dữ liệu và không thể hoàn tác.',
      confirmLabel: 'Xóa hết',
      isDanger: true,
      onConfirm: () => {
        setState(getFreshState());
        setIsSettingsOpen(false);
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        showToast('Đã xóa toàn bộ dữ liệu.');
      },
    });
  };

  const handleLoadSamplePlayers = () => {
    let curSeq = state.seq;
    const newOnes: Player[] = SAMPLE_PLAYERS.map((s) => {
      curSeq++;
      return {
        id: curSeq,
        name: s.name,
        g: s.g,
        on: true,
        turns: 0,
        last: 0,
        del: false,
      };
    });

    setState((prev) => ({
      ...prev,
      seq: curSeq,
      players: [...prev.players.filter((p) => !p.del), ...newOnes],
    }));
    showToast('Đã nạp 12 người chơi mẫu (4 Nam A, 4 Nam B, 4 Nữ)!');
  };

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#14233a] flex flex-col font-sans pb-24">
      {/* Top Header */}
      <Header
        players={state.players}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 pt-4">
        {state.tab === 'courts' && (
          <CourtsTab
            courts={state.courts}
            active={state.active}
            players={state.players}
            history={state.history}
            sameType={state.sameType}
            rollingCourts={rollingCourts}
            rollingNames={rollingNames}
            onDrawCourt={handleDrawCourt}
            onDrawAllFree={handleDrawAllFree}
            onScoreChange={handleScoreChange}
            onQuickScore={handleQuickScore}
            onFinishMatch={handleFinishMatch}
            onCancelMatch={handleCancelMatch}
            onNavigateToPlayers={() => setState((s) => ({ ...s, tab: 'players' }))}
            onLoadSamplePlayers={handleLoadSamplePlayers}
          />
        )}

        {state.tab === 'players' && (
          <PlayersTab
            players={state.players}
            active={state.active}
            history={state.history}
            selectedGroup={state.addG}
            onSelectGroup={(g) => setState((s) => ({ ...s, addG: g }))}
            onAddPlayers={handleAddPlayers}
            onToggleAttendance={handleToggleAttendance}
            onChangePlayerGroup={handleChangePlayerGroup}
            onDeletePlayer={handleDeletePlayer}
            onLoadSamplePlayers={handleLoadSamplePlayers}
          />
        )}

        {state.tab === 'rank' && (
          <RankTab
            players={state.players}
            history={state.history}
            filter={state.rankF}
            onFilterChange={(f) => setState((s) => ({ ...s, rankF: f }))}
            onToast={showToast}
          />
        )}

        {state.tab === 'history' && (
          <HistoryTab
            history={state.history}
            players={state.players}
            onDeleteMatch={handleDeleteMatch}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navigation
        currentTab={state.tab}
        onSelectTab={(tab) => {
          setState((s) => ({ ...s, tab }));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeMatchCount={Object.keys(state.active).length}
        playerCount={getPresentPlayers(state.players).length}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        courts={state.courts}
        sameType={state.sameType}
        state={state}
        onClose={() => setIsSettingsOpen(false)}
        onCourtsChange={(courts) => setState((s) => ({ ...s, courts }))}
        onToggleSameType={() => setState((s) => ({ ...s, sameType: !s.sameType }))}
        onNewSession={handleNewSession}
        onWipeData={handleWipeData}
        onRestoreState={(newState) => setState(newState)}
        onToast={showToast}
      />

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((m) => ({ ...m, isOpen: false }))}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
