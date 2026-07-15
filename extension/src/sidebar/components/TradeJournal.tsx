// ============================================================
// TradeJournal — Trade journal CRUD with psychology tracking
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Trash2,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Brain,
} from 'lucide-react';
import { useTradeStore } from '../stores/trade-store';
import { formatCurrency, generateId } from '@shared/utils/formatters';
import type { TradeJournalEntry } from '@shared/types';

export function TradeJournal() {
  const entries = useTradeStore((s) => s.journalEntries);
  const addEntry = useTradeStore((s) => s.addJournalEntry);
  const removeEntry = useTradeStore((s) => s.removeJournalEntry);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'OPEN'>('ALL');

  const filtered = entries.filter(
    (e) => filter === 'ALL' || e.result === filter,
  );

  const handleAdd = (entry: Partial<TradeJournalEntry>) => {
    const newEntry: TradeJournalEntry = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      symbol: entry.symbol || 'NIFTY',
      direction: entry.direction || 'CALL',
      entryPrice: entry.entryPrice || 0,
      exitPrice: entry.exitPrice || null,
      stopLoss: entry.stopLoss || 0,
      target: entry.target || 0,
      quantity: entry.quantity || 1,
      pnl: entry.pnl || null,
      pnlPercent: null,
      riskReward: 0,
      score: entry.score || 0,
      result: (entry.result as TradeJournalEntry['result']) || 'OPEN',
      notes: entry.notes || '',
      mistakes: entry.mistakes || [],
      psychologyNotes: entry.psychologyNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addEntry(newEntry);
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <BookOpen size={14} />
          Trade Journal
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-primary-600/20 px-2.5 py-1 text-2xs font-medium text-primary-300 transition-all hover:bg-primary-600/30"
        >
          <Plus size={10} />
          New Entry
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-0.5 rounded-lg bg-surface-50 p-0.5">
        {(['ALL', 'WIN', 'LOSS', 'OPEN'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-md px-2 py-1.5 text-2xs font-medium transition-all ${
              filter === f
                ? 'bg-primary-600/30 text-white'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* New Entry Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <JournalForm
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onDelete={() => removeEntry(entry.id)}
            />
          ))
        ) : (
          <div className="glass-card py-8 text-center">
            <BookOpen size={24} className="mx-auto mb-2 text-white/10" />
            <p className="text-sm text-white/30">No journal entries</p>
            <p className="text-2xs mt-1 text-white/15">
              Log your trades to track performance and improve
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Journal entry form */
function JournalForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (entry: Partial<TradeJournalEntry>) => void;
  onCancel: () => void;
}) {
  const [symbol, setSymbol] = useState('NIFTY');
  const [direction, setDirection] = useState<'CALL' | 'PUT'>('CALL');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [target, setTarget] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [notes, setNotes] = useState('');
  const [psychology, setPsychology] = useState('');
  const [mistakes, setMistakes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      symbol,
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      stopLoss: parseFloat(stopLoss) || 0,
      target: parseFloat(target) || 0,
      quantity: parseInt(quantity) || 1,
      notes,
      psychologyNotes: psychology,
      mistakes: mistakes
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      result: 'OPEN',
    });
  };

  return (
    <div className="glass-card space-y-2.5">
      <h4 className="text-xs font-semibold text-white/60">Log New Trade</h4>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-2xs text-white/30">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full rounded-lg border border-surface-200 bg-surface-50 px-2 py-1.5 text-2xs text-white outline-none"
          >
            <option value="NIFTY">NIFTY</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
            <option value="FINNIFTY">FINNIFTY</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-2xs text-white/30">Direction</label>
          <div className="flex gap-1">
            <button
              onClick={() => setDirection('CALL')}
              className={`flex-1 rounded-lg py-1.5 text-2xs font-semibold transition-all ${
                direction === 'CALL'
                  ? 'bg-bullish/20 text-bullish'
                  : 'bg-surface-50 text-white/30'
              }`}
            >
              CALL
            </button>
            <button
              onClick={() => setDirection('PUT')}
              className={`flex-1 rounded-lg py-1.5 text-2xs font-semibold transition-all ${
                direction === 'PUT'
                  ? 'bg-bearish/20 text-bearish'
                  : 'bg-surface-50 text-white/30'
              }`}
            >
              PUT
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <FormInput label="Entry" value={entryPrice} onChange={setEntryPrice} placeholder="24500" />
        <FormInput label="Stop Loss" value={stopLoss} onChange={setStopLoss} placeholder="24400" />
        <FormInput label="Target" value={target} onChange={setTarget} placeholder="24650" />
      </div>

      <FormInput label="Quantity" value={quantity} onChange={setQuantity} placeholder="50" />

      <div>
        <label className="mb-1 block text-2xs text-white/30">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why did you take this trade?"
          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-2 py-1.5 text-2xs text-white placeholder-white/20 outline-none"
          rows={2}
        />
      </div>

      <div>
        <label className="mb-1 flex items-center gap-1 text-2xs text-white/30">
          <Brain size={10} /> Psychology Notes
        </label>
        <textarea
          value={psychology}
          onChange={(e) => setPsychology(e.target.value)}
          placeholder="How were you feeling? Any FOMO, revenge trading?"
          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-2 py-1.5 text-2xs text-white placeholder-white/20 outline-none"
          rows={2}
        />
      </div>

      <div>
        <label className="mb-1 block text-2xs text-white/30">Mistakes (comma-separated)</label>
        <input
          value={mistakes}
          onChange={(e) => setMistakes(e.target.value)}
          placeholder="Early entry, moved SL, oversized"
          className="w-full rounded-lg border border-surface-200 bg-surface-50 px-2 py-1.5 text-2xs text-white placeholder-white/20 outline-none"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary-600 py-2 text-2xs font-semibold text-white transition-all hover:bg-primary-500"
        >
          <Check size={12} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center justify-center gap-1 rounded-lg bg-surface-100 px-4 py-2 text-2xs text-white/50 transition-all hover:bg-surface-200"
        >
          <X size={12} />
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Journal entry card */
function JournalCard({
  entry,
  onDelete,
}: {
  entry: TradeJournalEntry;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const getResultBadge = () => {
    switch (entry.result) {
      case 'WIN':
        return 'badge-bullish';
      case 'LOSS':
        return 'badge-bearish';
      case 'BREAKEVEN':
        return 'badge-neutral';
      default:
        return 'badge-info';
    }
  };

  return (
    <motion.div
      layout
      className="glass-card cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {entry.direction === 'CALL' ? (
            <TrendingUp size={12} className="text-bullish" />
          ) : (
            <TrendingDown size={12} className="text-bearish" />
          )}
          <span className="text-xs font-semibold text-white/80">
            {entry.symbol}
          </span>
          <span
            className={`text-2xs font-bold ${
              entry.direction === 'CALL' ? 'text-bullish' : 'text-bearish'
            }`}
          >
            {entry.direction}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={getResultBadge()}>{entry.result}</span>
          <span className="flex items-center gap-0.5 text-2xs text-white/25">
            <Calendar size={8} />
            {entry.date}
          </span>
        </div>
      </div>

      {/* Price row */}
      <div className="mt-1.5 flex items-center gap-3 text-2xs">
        <span className="text-white/40">
          Entry:{' '}
          <span className="font-mono text-white/70">{formatCurrency(entry.entryPrice, 1)}</span>
        </span>
        <span className="text-white/40">
          SL: <span className="font-mono text-bearish/70">{formatCurrency(entry.stopLoss, 1)}</span>
        </span>
        <span className="text-white/40">
          Tgt: <span className="font-mono text-bullish/70">{formatCurrency(entry.target, 1)}</span>
        </span>
        {entry.pnl !== null && (
          <span
            className={`ml-auto font-mono font-bold ${
              entry.pnl >= 0 ? 'text-bullish' : 'text-bearish'
            }`}
          >
            {entry.pnl >= 0 ? '+' : ''}
            {formatCurrency(entry.pnl, 0)}
          </span>
        )}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1.5 border-t border-surface-200 pt-2"
          >
            {entry.notes && (
              <div>
                <span className="text-2xs font-semibold text-white/35">Notes</span>
                <p className="text-2xs text-white/55">{entry.notes}</p>
              </div>
            )}
            {entry.psychologyNotes && (
              <div>
                <span className="flex items-center gap-1 text-2xs font-semibold text-white/35">
                  <Brain size={8} /> Psychology
                </span>
                <p className="text-2xs text-white/55">{entry.psychologyNotes}</p>
              </div>
            )}
            {entry.mistakes.length > 0 && (
              <div>
                <span className="text-2xs font-semibold text-bearish/50">Mistakes</span>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {entry.mistakes.map((m, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-bearish/10 px-2 py-0.5 text-2xs text-bearish/70"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-2xs text-bearish/40 transition-colors hover:bg-bearish/10 hover:text-bearish/60"
            >
              <Trash2 size={10} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Simple form input */
function FormInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-2xs text-white/30">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-surface-200 bg-surface-50 px-2 py-1.5 text-2xs text-white placeholder-white/20 outline-none"
      />
    </div>
  );
}
