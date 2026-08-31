import React, { useState, useEffect } from 'react';
import { Deck, ImportResult } from '../../types/index.js';
import { importExportApi, decksApi } from '../../api/index.js';
import {
  FileText,
  Upload,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Check,
  RefreshCw
} from 'lucide-react';

interface ImportExportViewProps {
  onCollectionUpdated?: () => void;
  notify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  onCollectionUpdated,
  notify
}) => {
  const [subTab, setSubTab] = useState<'import' | 'export-collection' | 'export-deck'>('import');

  // Import Tab State
  const [importText, setImportText] = useState<string>(
    `# Lista de Exemplo para Coleção
3 Mystic Shot
1 Swain, Grand General
2 Darius, Hand of Noxus
4 Rune of Blood
2 The Immortal Bastion
3 Trifarian Gloryseeker`
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Export Collection Tab State
  const [collectionExportText, setCollectionExportText] = useState<string>('');
  const [loadingCollectionExport, setLoadingCollectionExport] = useState(false);
  const [copiedCollection, setCopiedCollection] = useState(false);

  // Export Deck Tab State
  const [decksList, setDecksList] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<number | ''>('');
  const [deckExportText, setDeckExportText] = useState<string>('');
  const [loadingDeckExport, setLoadingDeckExport] = useState(false);
  const [copiedDeck, setCopiedDeck] = useState(false);

  // Load decks for deck export tab
  useEffect(() => {
    decksApi.getDecks().then((decks) => {
      setDecksList(decks);
      if (decks.length > 0 && selectedDeckId === '') {
        setSelectedDeckId(decks[0].id);
      }
    }).catch(() => {});
  }, [selectedDeckId]);

  // Load collection export text when switching to export collection
  useEffect(() => {
    if (subTab === 'export-collection') {
      setLoadingCollectionExport(true);
      importExportApi.exportCollection()
        .then((res) => setCollectionExportText(res.text))
        .catch((err) => {
          if (notify) notify(err.message || 'Erro ao exportar coleção.', 'error');
        })
        .finally(() => setLoadingCollectionExport(false));
    }
  }, [subTab, notify]);

  // Load deck export text when selected deck changes
  useEffect(() => {
    if (subTab === 'export-deck' && selectedDeckId !== '') {
      setLoadingDeckExport(true);
      importExportApi.exportDeck(Number(selectedDeckId))
        .then((res) => setDeckExportText(res.text))
        .catch((err) => {
          if (notify) notify(err.message || 'Erro ao exportar deck.', 'error');
        })
        .finally(() => setLoadingDeckExport(false));
    }
  }, [subTab, selectedDeckId, notify]);

  // Handle Import Submit
  const handleRunImport = async () => {
    if (!importText.trim()) {
      if (notify) notify('Cole o texto da lista para importar.', 'info');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importExportApi.importCollection(importText);
      setImportResult(result);

      if (result.success) {
        if (notify) notify(`Importação concluída com sucesso! ${result.foundCards.length} cartas adicionadas.`, 'success');
        if (onCollectionUpdated) onCollectionUpdated();
      } else {
        if (notify) notify('A importação falhou devido a erros ou cartas não reconhecidas.', 'error');
      }
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao processar importação.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const copyCollectionExport = () => {
    navigator.clipboard.writeText(collectionExportText);
    setCopiedCollection(true);
    setTimeout(() => setCopiedCollection(false), 2000);
    if (notify) notify('Coleção copiada com sucesso!', 'success');
  };

  const downloadCollectionTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([collectionExportText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'rift_minha_colecao.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyDeckExport = () => {
    navigator.clipboard.writeText(deckExportText);
    setCopiedDeck(true);
    setTimeout(() => setCopiedDeck(false), 2000);
    if (notify) notify('Deck copiado com sucesso!', 'success');
  };

  const downloadDeckTxt = () => {
    const selectedDeck = decksList.find((d) => d.id === Number(selectedDeckId));
    const filename = selectedDeck ? `${selectedDeck.name.toLowerCase().replace(/\s+/g, '_')}.txt` : 'deck.txt';
    const element = document.createElement('a');
    const file = new Blob([deckExportText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Importação e Exportação
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Troque dados em formato de texto simples entre a sua coleção, decks e ferramentas de terceiros.
        </p>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="mt-6 flex border-b border-slate-200">
        <button
          id="tab-import-collection"
          onClick={() => setSubTab('import')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            subTab === 'import'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Importar para Coleção</span>
        </button>

        <button
          id="tab-export-collection"
          onClick={() => setSubTab('export-collection')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            subTab === 'export-collection'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>Exportar Coleção</span>
        </button>

        <button
          id="tab-export-deck"
          onClick={() => setSubTab('export-deck')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            subTab === 'export-deck'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Exportar Deck</span>
        </button>
      </div>

      {/* SUBTAB 1: IMPORTAR COLEÇÃO */}
      {subTab === 'import' && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Input Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Cole sua Lista de Cartas
              </h3>
              <button
                type="button"
                onClick={() =>
                  setImportText(
                    `# Exemplo válido\n3 Mystic Shot\n2 Decimate\n1 Lux, Lady of Luminosity\n3 Vanguard Defender\n4 Rune of Light`
                  )
                }
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Preencher Exemplo</span>
              </button>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Formato aceito: <code className="text-indigo-600 font-semibold">&lt;quantidade&gt; &lt;nome da carta&gt;</code> por linha. Linhas começando com <code className="text-slate-400">#</code>, <code className="text-slate-400">//</code> ou <code className="text-slate-400">--</code> são ignoradas.
            </p>

            <textarea
              id="import-text-input"
              rows={12}
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportResult(null);
              }}
              placeholder="3 Mystic Shot&#10;1 Swain, Grand General&#10;# Linha comentada&#10;2 Rune of Blood"
              className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
            />

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setImportText('');
                  setImportResult(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Limpar Texto
              </button>

              <button
                id="run-import-btn"
                disabled={isImporting || !importText.trim()}
                onClick={handleRunImport}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Upload className="h-4 w-4" />
                <span>{isImporting ? 'Validando...' : 'Validar e Importar'}</span>
              </button>
            </div>
          </div>

          {/* Results / Live Feedback Panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              Resultado da Validação
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              O backend avalia linha por linha. Se houver qualquer erro de formato ou carta não encontrada, nada é salvo.
            </p>

            {!importResult ? (
              <div className="mt-12 flex flex-col items-center justify-center text-center text-slate-400 text-xs py-8">
                <FileText className="h-10 w-10 text-slate-300 mb-2" />
                <span>Clique em "Validar e Importar" para processar a lista acima.</span>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Success or Error Global Banner */}
                {importResult.success ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-800">
                    <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Importação Realizada com Sucesso!
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Todas as {importResult.foundCards.length} cartas foram reconhecidas e adicionadas à sua coleção.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800">
                    <XCircle className="h-6 w-6 shrink-0 text-rose-600" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Importação Bloqueada
                      </h4>
                      <p className="text-xs text-rose-700 mt-0.5">
                        Corrija os erros apontados abaixo antes de importar. Nenhuma alteração foi salva.
                      </p>
                    </div>
                  </div>
                )}

                {/* Parser Syntax Errors */}
                {importResult.parserErrors.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                    <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="h-3.5 w-3.5" /> Erros de Sintaxe ({importResult.parserErrors.length})
                    </h5>
                    <div className="space-y-1 text-xs">
                      {importResult.parserErrors.map((err, i) => (
                        <div key={i} className="text-rose-800 font-mono bg-white p-2 rounded-lg border border-rose-200 shadow-xs">
                          Linha {err.line}: <span className="underline font-bold">{err.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not Found Cards */}
                {importResult.notFoundCards.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                    <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="h-3.5 w-3.5" /> Cartas Não Encontradas no Catálogo ({importResult.notFoundCards.length})
                    </h5>
                    <div className="space-y-1 text-xs">
                      {importResult.notFoundCards.map((item, i) => (
                        <div key={i} className="text-amber-800 font-mono bg-white p-2 rounded-lg border border-amber-200 shadow-xs">
                          Linha {item.line}: "{item.cardName}" (Qtd: {item.quantity})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Found Matched Cards */}
                {importResult.foundCards.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 max-h-56 overflow-y-auto">
                    <h5 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Cartas Reconhecidas ({importResult.foundCards.length})
                    </h5>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 text-xs">
                      {importResult.foundCards.map((item, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 border border-slate-200 shadow-xs">
                          <span className="font-semibold text-slate-800 truncate">{item.card.name}</span>
                          <span className="font-bold text-indigo-600 shrink-0 ml-1">{item.entry.quantity}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: EXPORTAR COLEÇÃO */}
      {subTab === 'export-collection' && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm max-w-3xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Exportar Coleção Inteira
              </h3>
              <p className="text-xs text-slate-500">
                Gera a lista completa de todas as cartas e quantidades da sua coleção.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyCollectionExport}
                className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-xs"
              >
                {copiedCollection ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copiedCollection ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={downloadCollectionTxt}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Arquivo .txt</span>
              </button>
            </div>
          </div>

          {loadingCollectionExport ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <textarea
              readOnly
              rows={14}
              value={collectionExportText || '# Sua coleção está vazia.'}
              className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs text-slate-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      )}

      {/* SUBTAB 3: EXPORTAR DECK */}
      {subTab === 'export-deck' && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm max-w-3xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Exportar Deck Específico
              </h3>
              <p className="text-xs text-slate-500">
                Gera o deck agrupado por zona (<code className="text-indigo-600 font-semibold"># LEGEND</code>, <code className="text-indigo-600 font-semibold"># CHAMPION</code>, <code className="text-indigo-600 font-semibold"># MAIN</code>, etc.).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedDeckId}
                onChange={(e) => setSelectedDeckId(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                {decksList.map((d) => (
                  <option key={d.id} value={d.id}>
                    Deck #{d.id}: {d.name}
                  </option>
                ))}
              </select>

              <button
                onClick={copyDeckExport}
                className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors border border-slate-300 shadow-xs"
              >
                {copiedDeck ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copiedDeck ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={downloadDeckTxt}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-xs font-bold text-white transition-colors shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Baixar .txt</span>
              </button>
            </div>
          </div>

          {loadingDeckExport ? (
            <div className="flex h-48 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <textarea
              readOnly
              rows={14}
              value={deckExportText || '# Nenhuma carta adicionada neste deck ainda.'}
              className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs text-slate-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}
        </div>
      )}
    </div>
  );
};
