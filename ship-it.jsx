import { useState, useEffect, useCallback } from "react";

const PLATFORMS = ["Instagram", "Reels", "YouTube Shorts", "Telegram", "Другое"];

const CONTENT_TYPES = [
  { name: "Текстовый пост", xp: 10, emoji: "📝" },
  { name: "Сторис-серия", xp: 15, emoji: "📱" },
  { name: "Видео/Рилс", xp: 25, emoji: "🎬" },
  { name: "Кейс с цифрами", xp: 40, emoji: "📊" },
  { name: "Коллаб/эфир", xp: 50, emoji: "🤝" },
  { name: "Мем/юмор", xp: 10, emoji: "😂" },
  { name: "Скринкаст/туториал", xp: 35, emoji: "🖥️" },
  { name: "Голосовое/подкаст", xp: 20, emoji: "🎙️" },
];

const ROULETTE_TASKS = [
  "Кейс: покажи результат клиента в цифрах",
  "Мем про холодные рассылки",
  "Сторителлинг: как ты пришёл к продукту",
  "Скриншот CRM + разбор воронки",
  "Видео-ответ на частый вопрос клиента",
  "Закулисье: покажи процесс работы",
  "Пост-провокация: спорное мнение о лидгене",
  "Разбор ошибки: что НЕ работает",
  "Сравнение: до/после внедрения AI",
  "Голосовое: 3 инсайта за неделю",
  "Карусель: 5 шагов к первым лидам",
  "Reels: покажи интерфейс продукта за 30 сек",
  "Пост-список: топ инструментов для лидгена",
  "История клиента от его лица",
  "Челлендж: запусти кампанию в прямом эфире",
  "Пост «А вы знали?» — неочевидный факт о нише",
  "Видео: разбор одной фичи продукта за 60 сек",
  "Опрос/голосование в сторис",
];

const LEVELS = [
  { name: "Новичок", minXp: 0, icon: "🌱" },
  { name: "Контент-боец", minXp: 50, icon: "⚔️" },
  { name: "Охотник за лидами", minXp: 150, icon: "🎯" },
  { name: "Мастер воронок", minXp: 350, icon: "🌀" },
  { name: "Архитектор систем", minXp: 600, icon: "🏗️" },
  { name: "Мастер спиралей", minXp: 1000, icon: "🔮" },
  { name: "Легенда Ship It", minXp: 1500, icon: "👑" },
];

const ACHIEVEMENTS = [
  { id: "first", name: "Первый шаг", desc: "Опубликуй первый пост", check: (s) => s.totalPosts >= 1, icon: "🚀" },
  { id: "streak7", name: "Неделя огня", desc: "7 дней подряд", check: (s) => s.streak >= 7, icon: "🔥" },
  { id: "streak30", name: "Несгибаемый", desc: "30 дней подряд", check: (s) => s.streak >= 30, icon: "💎" },
  { id: "xp100", name: "Сотня", desc: "Набери 100 XP", check: (s) => s.totalXp >= 100, icon: "💯" },
  { id: "xp500", name: "Полтысячи", desc: "Набери 500 XP", check: (s) => s.totalXp >= 500, icon: "⚡" },
  { id: "case5", name: "Кейсоман", desc: "5 кейсов с цифрами", check: (s) => (s.typeCount?.["Кейс с цифрами"] || 0) >= 5, icon: "📊" },
  { id: "video10", name: "Видеомейкер", desc: "10 видео/рилсов", check: (s) => (s.typeCount?.["Видео/Рилс"] || 0) >= 10, icon: "🎬" },
  { id: "multi3", name: "Мультиплатформа", desc: "Публикуй на 3+ площадках", check: (s) => (s.platformsUsed?.length || 0) >= 3, icon: "🌐" },
  { id: "posts50", name: "Полсотни", desc: "50 постов всего", check: (s) => s.totalPosts >= 50, icon: "🏆" },
];

function getLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) lvl = l;
  }
  return lvl;
}

function getNextLevel(xp) {
  for (const l of LEVELS) {
    if (xp < l.minXp) return l;
  }
  return null;
}

function loadState() {
  try {
    const raw = localStorage.getItem("ship_it_v1");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem("ship_it_v1", JSON.stringify(state));
  } catch {}
}

const defaultState = {
  totalXp: 0,
  totalPosts: 0,
  streak: 0,
  bestStreak: 0,
  lastPostDate: null,
  log: [],
  typeCount: {},
  platformsUsed: [],
  unlockedAchievements: [],
};

export default function ShipIt() {
  const [state, setState] = useState(() => loadState() || defaultState);
  const [view, setView] = useState("dashboard");
  const [rouletteResult, setRouletteResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const today = new Date().toISOString().split("T")[0];
  const postedToday = state.lastPostDate === today;

  const level = getLevel(state.totalXp);
  const nextLevel = getNextLevel(state.totalXp);
  const levelProgress = nextLevel
    ? ((state.totalXp - level.minXp) / (nextLevel.minXp - level.minXp)) * 100
    : 100;

  const logPost = useCallback(() => {
    if (!selectedType) return;
    const ct = CONTENT_TYPES.find((c) => c.name === selectedType);
    if (!ct) return;

    setState((prev) => {
      const isConsecutive =
        prev.lastPostDate === null ||
        prev.lastPostDate === today ||
        (() => {
          const last = new Date(prev.lastPostDate);
          const now = new Date(today);
          const diff = (now - last) / (1000 * 60 * 60 * 24);
          return diff <= 1;
        })();

      const newStreak =
        prev.lastPostDate === today
          ? prev.streak
          : isConsecutive
          ? prev.streak + 1
          : 1;

      const streakBonus = newStreak >= 7 ? Math.floor(ct.xp * 0.5) : newStreak >= 3 ? Math.floor(ct.xp * 0.25) : 0;

      const newTypeCount = { ...prev.typeCount };
      newTypeCount[ct.name] = (newTypeCount[ct.name] || 0) + 1;

      const newPlatforms = [...(prev.platformsUsed || [])];
      if (selectedPlatform && !newPlatforms.includes(selectedPlatform)) {
        newPlatforms.push(selectedPlatform);
      }

      const newState = {
        ...prev,
        totalXp: prev.totalXp + ct.xp + streakBonus,
        totalPosts: prev.totalPosts + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        lastPostDate: today,
        typeCount: newTypeCount,
        platformsUsed: newPlatforms,
        log: [
          {
            date: today,
            type: ct.name,
            xp: ct.xp,
            bonus: streakBonus,
            platform: selectedPlatform,
          },
          ...prev.log,
        ].slice(0, 100),
      };

      // Check achievements
      const stats = { ...newState, typeCount: newTypeCount, platformsUsed: newPlatforms };
      for (const ach of ACHIEVEMENTS) {
        if (!newState.unlockedAchievements.includes(ach.id) && ach.check(stats)) {
          newState.unlockedAchievements = [...newState.unlockedAchievements, ach.id];
          setTimeout(() => {
            setNewAchievement(ach);
            setShowConfetti(true);
            setTimeout(() => { setNewAchievement(null); setShowConfetti(false); }, 3000);
          }, 300);
        }
      }

      return newState;
    });

    setSelectedType(null);
    setSelectedPlatform(null);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  }, [selectedType, selectedPlatform, today]);

  const spinRoulette = () => {
    setIsSpinning(true);
    setRouletteResult(null);
    let count = 0;
    const interval = setInterval(() => {
      setRouletteResult(ROULETTE_TASKS[Math.floor(Math.random() * ROULETTE_TASKS.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        setRouletteResult(ROULETTE_TASKS[Math.floor(Math.random() * ROULETTE_TASKS.length)]);
      }
    }, 100 + count * 15);
  };

  const resetGame = () => {
    if (confirm("Точно сбросить весь прогресс? Это необратимо.")) {
      setState(defaultState);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hasPost = state.log.some((l) => l.date === dateStr);
    return { date: dateStr, day: d.toLocaleDateString("ru-RU", { weekday: "short" }), hasPost };
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e8e6e1",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none", zIndex: 0,
      }} />

      {showConfetti && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100,
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <div style={{ fontSize: 64, animation: "pop 0.5s ease-out" }}>⚡</div>
        </div>
      )}

      {newAchievement && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "1px solid #e2c044",
          borderRadius: 12, padding: "16px 28px", zIndex: 200,
          animation: "slideDown 0.4s ease-out",
          textAlign: "center", boxShadow: "0 0 30px rgba(226,192,68,0.3)",
        }}>
          <div style={{ fontSize: 32 }}>{newAchievement.icon}</div>
          <div style={{ color: "#e2c044", fontWeight: 700, fontSize: 14, marginTop: 4 }}>
            ACHIEVEMENT UNLOCKED
          </div>
          <div style={{ fontSize: 16, marginTop: 4 }}>{newAchievement.name}</div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#666", textTransform: "uppercase" }}>
            ship every day
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, margin: "8px 0 4px",
            background: "linear-gradient(135deg, #e2c044, #f0e68c, #e2c044)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: -1,
          }}>
            SHIP IT
          </h1>
          <div style={{ fontSize: 12, color: "#555" }}>
            {level.icon} {level.name} • {state.totalXp} XP
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#111118", borderRadius: 10, padding: 4 }}>
          {[
            { id: "dashboard", label: "Главная" },
            { id: "log", label: "+Пост" },
            { id: "roulette", label: "Рулетка" },
            { id: "stats", label: "Стата" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              style={{
                flex: 1, padding: "10px 0", fontSize: 12, fontWeight: 600,
                border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: 0.5,
                background: view === tab.id ? "#e2c044" : "transparent",
                color: view === tab.id ? "#0a0a0f" : "#666",
                transition: "all 0.2s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            {/* XP Progress */}
            <div style={{
              background: "#111118", borderRadius: 12, padding: 20, marginBottom: 12,
              border: "1px solid #1a1a24",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#e2c044", lineHeight: 1 }}>
                    {state.totalXp}
                  </div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>EXPERIENCE POINTS</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 42 }}>{level.icon}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{level.name}</div>
                </div>
              </div>
              {nextLevel && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#555", marginBottom: 4 }}>
                    <span>LVL UP</span>
                    <span>{nextLevel.minXp - state.totalXp} XP до «{nextLevel.name}»</span>
                  </div>
                  <div style={{ height: 6, background: "#1a1a24", borderRadius: 3 }}>
                    <div style={{
                      height: "100%", borderRadius: 3,
                      background: "linear-gradient(90deg, #e2c044, #f0e68c)",
                      width: `${Math.min(levelProgress, 100)}%`,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Streak + Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[
                { label: "STREAK", value: state.streak, suffix: "д.", color: state.streak >= 7 ? "#e2c044" : "#e8e6e1" },
                { label: "BEST", value: state.bestStreak, suffix: "д.", color: "#888" },
                { label: "ПОСТЫ", value: state.totalPosts, suffix: "", color: "#e8e6e1" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "#111118", borderRadius: 10, padding: "14px 12px",
                  border: "1px solid #1a1a24", textAlign: "center",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
                    {s.value}<span style={{ fontSize: 12, color: "#555" }}>{s.suffix}</span>
                  </div>
                  <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Week view */}
            <div style={{
              background: "#111118", borderRadius: 12, padding: 16, marginBottom: 12,
              border: "1px solid #1a1a24",
            }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 10 }}>НЕДЕЛЯ</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>{d.day}</div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: d.hasPost ? "linear-gradient(135deg, #e2c044, #d4a934)" : "#1a1a24",
                      color: d.hasPost ? "#0a0a0f" : "#333",
                      fontSize: 14, fontWeight: 700,
                    }}>
                      {d.hasPost ? "✓" : "·"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => setView("log")} style={{
                padding: 16, background: "linear-gradient(135deg, #e2c044, #d4a934)",
                color: "#0a0a0f", border: "none", borderRadius: 12, cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14,
              }}>
                + Залогать пост
              </button>
              <button onClick={() => setView("roulette")} style={{
                padding: 16, background: "#111118", color: "#e2c044",
                border: "1px solid #e2c044", borderRadius: 12, cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700, fontSize: 14,
              }}>
                🎰 Рулетка
              </button>
            </div>

            {/* Today status */}
            <div style={{
              marginTop: 12, padding: "12px 16px", borderRadius: 10,
              background: postedToday ? "#0d1f0d" : "#1f0d0d",
              border: `1px solid ${postedToday ? "#1a3a1a" : "#3a1a1a"}`,
              textAlign: "center", fontSize: 13,
              color: postedToday ? "#4ade80" : "#f87171",
            }}>
              {postedToday ? "✅ Сегодня пост есть — цепочка жива!" : "⚠️ Сегодня ещё нет поста — не сломай стрик!"}
            </div>
          </div>
        )}

        {/* LOG POST */}
        {view === "log" && (
          <div>
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>ТИП КОНТЕНТА</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct.name}
                  onClick={() => setSelectedType(ct.name)}
                  style={{
                    padding: "14px 12px", borderRadius: 10, cursor: "pointer",
                    fontFamily: "inherit", textAlign: "left",
                    background: selectedType === ct.name ? "#1a1a2e" : "#111118",
                    border: `1px solid ${selectedType === ct.name ? "#e2c044" : "#1a1a24"}`,
                    color: selectedType === ct.name ? "#e2c044" : "#888",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 20 }}>{ct.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{ct.name}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>+{ct.xp} XP</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>ПЛОЩАДКА</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                    fontFamily: "inherit", fontWeight: 600,
                    background: selectedPlatform === p ? "#e2c044" : "#111118",
                    color: selectedPlatform === p ? "#0a0a0f" : "#666",
                    border: `1px solid ${selectedPlatform === p ? "#e2c044" : "#1a1a24"}`,
                    transition: "all 0.2s",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {selectedType && (
              <div style={{
                background: "#111118", borderRadius: 12, padding: 16, marginBottom: 16,
                border: "1px solid #1a1a24", textAlign: "center",
              }}>
                <div style={{ fontSize: 12, color: "#888" }}>Будет начислено</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#e2c044", marginTop: 4 }}>
                  +{CONTENT_TYPES.find((c) => c.name === selectedType)?.xp || 0} XP
                  {state.streak >= 7 && <span style={{ fontSize: 14, color: "#4ade80" }}> +50% бонус</span>}
                  {state.streak >= 3 && state.streak < 7 && <span style={{ fontSize: 14, color: "#4ade80" }}> +25% бонус</span>}
                </div>
              </div>
            )}

            <button
              onClick={logPost}
              disabled={!selectedType}
              style={{
                width: "100%", padding: 16, borderRadius: 12, border: "none",
                cursor: selectedType ? "pointer" : "not-allowed",
                fontFamily: "inherit", fontSize: 16, fontWeight: 800,
                background: selectedType
                  ? "linear-gradient(135deg, #e2c044, #d4a934)"
                  : "#1a1a24",
                color: selectedType ? "#0a0a0f" : "#333",
                transition: "all 0.2s",
                letterSpacing: 1,
              }}
            >
              {selectedType ? "⚡ ЗАЛОГАТЬ" : "Выбери тип контента"}
            </button>
          </div>
        )}

        {/* ROULETTE */}
        {view === "roulette" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: "#111118", borderRadius: 16, padding: 32, marginBottom: 20,
              border: "1px solid #1a1a24", minHeight: 160,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              {rouletteResult ? (
                <div style={{
                  fontSize: 18, fontWeight: 700, lineHeight: 1.5,
                  color: isSpinning ? "#555" : "#e2c044",
                  transition: "color 0.3s",
                }}>
                  {rouletteResult}
                </div>
              ) : (
                <div style={{ color: "#333", fontSize: 48 }}>🎰</div>
              )}
            </div>

            <button
              onClick={spinRoulette}
              disabled={isSpinning}
              style={{
                width: "100%", padding: 18, borderRadius: 12, border: "none",
                cursor: isSpinning ? "not-allowed" : "pointer",
                fontFamily: "inherit", fontSize: 16, fontWeight: 800,
                background: isSpinning
                  ? "#1a1a24"
                  : "linear-gradient(135deg, #e2c044, #d4a934)",
                color: isSpinning ? "#555" : "#0a0a0f",
                letterSpacing: 1,
                animation: isSpinning ? "pulse 0.5s infinite" : "none",
              }}
            >
              {isSpinning ? "КРУТИТСЯ..." : "🎲 КРУТИТЬ РУЛЕТКУ"}
            </button>

            {rouletteResult && !isSpinning && (
              <div style={{
                marginTop: 16, padding: 12, borderRadius: 10,
                background: "#0d1f0d", border: "1px solid #1a3a1a",
                fontSize: 12, color: "#4ade80",
              }}>
                Сделай этот контент, залогай пост и получи XP!
              </div>
            )}
          </div>
        )}

        {/* STATS */}
        {view === "stats" && (
          <div>
            {/* Achievements */}
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>ДОСТИЖЕНИЯ</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = state.unlockedAchievements.includes(ach.id);
                return (
                  <div key={ach.id} style={{
                    background: "#111118", borderRadius: 10, padding: 12, textAlign: "center",
                    border: `1px solid ${unlocked ? "#e2c044" : "#1a1a24"}`,
                    opacity: unlocked ? 1 : 0.4,
                  }}>
                    <div style={{ fontSize: 24 }}>{ach.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: unlocked ? "#e2c044" : "#555", marginTop: 4 }}>
                      {ach.name}
                    </div>
                    <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>{ach.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Content type breakdown */}
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>ПО ТИПАМ</div>
            <div style={{ marginBottom: 24 }}>
              {CONTENT_TYPES.filter((ct) => (state.typeCount?.[ct.name] || 0) > 0).map((ct) => (
                <div key={ct.name} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", background: "#111118", borderRadius: 8,
                  marginBottom: 4, border: "1px solid #1a1a24",
                }}>
                  <span style={{ fontSize: 16 }}>{ct.emoji}</span>
                  <span style={{ flex: 1, fontSize: 12, color: "#888" }}>{ct.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#e2c044" }}>
                    {state.typeCount[ct.name]}
                  </span>
                </div>
              ))}
              {Object.keys(state.typeCount || {}).length === 0 && (
                <div style={{ color: "#333", fontSize: 13, textAlign: "center", padding: 20 }}>
                  Пока пусто — залогай первый пост!
                </div>
              )}
            </div>

            {/* Recent log */}
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>ПОСЛЕДНИЕ ПОСТЫ</div>
            <div style={{ marginBottom: 24 }}>
              {state.log.slice(0, 10).map((entry, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", background: "#111118", borderRadius: 8,
                  marginBottom: 4, border: "1px solid #1a1a24",
                }}>
                  <span style={{ fontSize: 14 }}>
                    {CONTENT_TYPES.find((c) => c.name === entry.type)?.emoji || "📝"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "#888" }}>{entry.type}</div>
                    <div style={{ fontSize: 10, color: "#444" }}>{entry.date} • {entry.platform}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2c044" }}>+{entry.xp}</div>
                    {entry.bonus > 0 && (
                      <div style={{ fontSize: 9, color: "#4ade80" }}>+{entry.bonus} бонус</div>
                    )}
                  </div>
                </div>
              ))}
              {state.log.length === 0 && (
                <div style={{ color: "#333", fontSize: 13, textAlign: "center", padding: 20 }}>
                  История пока пуста
                </div>
              )}
            </div>

            {/* Levels roadmap */}
            <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, marginBottom: 12 }}>УРОВНИ</div>
            <div style={{ marginBottom: 24 }}>
              {LEVELS.map((l, i) => {
                const current = l.name === level.name;
                const reached = state.totalXp >= l.minXp;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", background: current ? "#1a1a2e" : "#111118",
                    borderRadius: 8, marginBottom: 4,
                    border: `1px solid ${current ? "#e2c044" : "#1a1a24"}`,
                    opacity: reached ? 1 : 0.35,
                  }}>
                    <span style={{ fontSize: 20 }}>{l.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: current ? 700 : 400, color: current ? "#e2c044" : "#888" }}>
                      {l.name}
                    </span>
                    <span style={{ fontSize: 11, color: "#555" }}>{l.minXp} XP</span>
                  </div>
                );
              })}
            </div>

            {/* Reset */}
            <button onClick={resetGame} style={{
              width: "100%", padding: 12, background: "transparent",
              border: "1px solid #2a1a1a", borderRadius: 10, cursor: "pointer",
              fontFamily: "inherit", fontSize: 11, color: "#553333",
              letterSpacing: 1,
            }}>
              СБРОСИТЬ ПРОГРЕСС
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { 0% { transform: translate(-50%, -100%); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
}
