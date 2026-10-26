import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  ArrowRight,
  GitFork,
  FileText,
  Network,
  ExternalLink,
  ShieldCheck,
  Info,
  CornerDownRight
} from 'lucide-react';
import { useCaseContext } from '../context/CaseContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { findConnections } from '../utils/pathFinder';

export const ConnectionFinderPage = () => {
  const {
    cases,
    activeCaseId,
    setActiveCaseId,
    activeCase,
    activeCaseEntities,
    activeCaseRelationships,
    focusEntityTarget,
    navigateToNetworkWithEntity
  } = useCaseContext();

  const [queryInput, setQueryInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [results, setResults] = useState(null);

  // If focusEntityTarget was passed from another view, prefill & execute search
  useEffect(() => {
    if (focusEntityTarget) {
      setQueryInput(focusEntityTarget);
      setActiveQuery(focusEntityTarget);
      const res = findConnections(
        focusEntityTarget,
        activeCaseEntities,
        activeCaseRelationships
      );
      setResults(res);
    }
  }, [focusEntityTarget, activeCaseEntities, activeCaseRelationships]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!queryInput.trim()) return;

    setActiveQuery(queryInput);
    const res = findConnections(
      queryInput,
      activeCaseEntities,
      activeCaseRelationships
    );
    setResults(res);
  };

  const handleSelectQuickSuggestion = (entityName) => {
    setQueryInput(entityName);
    setActiveQuery(entityName);
    const res = findConnections(
      entityName,
      activeCaseEntities,
      activeCaseRelationships
    );
    setResults(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#243447] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#3478C9]" />
            Text-Based Connection Finder
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Discover direct and 2-step recorded relational pathways for any entity in the case dossier
          </p>
        </div>

        {/* Case Switcher */}
        {cases.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white border border-[#D7E4F0] rounded-md px-3 py-1.5 text-xs shadow-2xs">
            <span className="font-semibold text-[#64748B]">Case:</span>
            <select
              value={activeCaseId}
              onChange={(e) => {
                setActiveCaseId(e.target.value);
                setResults(null);
                setQueryInput('');
              }}
              className="bg-transparent font-bold text-[#243447] focus:outline-hidden cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} – {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-lg border border-[#D7E4F0] p-5 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter person name, phone number, vehicle plate, or entity reference..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D7E4F0] rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#3478C9]"
            />
          </div>
          <Button type="submit" variant="primary" icon={Search}>
            Search Connections
          </Button>
        </form>

        {/* Quick entity suggestions chips */}
        {activeCaseEntities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-[11px] font-semibold text-[#64748B]">
              Quick Entities in Case:
            </span>
            {activeCaseEntities.slice(0, 7).map((ent) => (
              <button
                type="button"
                key={ent.id}
                onClick={() => handleSelectQuickSuggestion(ent.name)}
                className="px-2 py-1 rounded bg-[#F2F7FC] hover:bg-[#EAF4FC] hover:text-[#2866AE] border border-[#D7E4F0] text-[11px] text-[#243447] transition-colors cursor-pointer"
              >
                {ent.name}
              </button>
            ))}
          </div>
        )}

        {/* Disclaimer Notice */}
        <div className="p-2.5 bg-[#F2F7FC] rounded border border-[#D7E4F0] text-[11px] text-[#64748B] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#3478C9] shrink-0 mt-0.5" />
          <span>
            <strong>Evidentiary Scope:</strong> Search evaluates recorded case entities and documented
            relationships only. Does not query external or unrecorded intelligence sources.
          </span>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Target Entity Summary Card */}
          {results.searchedEntity ? (
            <div className="bg-white rounded-lg border border-[#3478C9] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#EAF4FC]/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2866AE]">
                  Query Subject
                </span>
                <h3 className="text-base font-bold text-[#243447] mt-0.5">
                  {results.searchedEntity.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Category: {results.searchedEntity.category} • ID: {results.searchedEntity.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Network}
                  onClick={() => navigateToNetworkWithEntity(results.searchedEntity.name)}
                >
                  View in Network Graph
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#D7E4F0] p-8 text-center">
              <h4 className="text-sm font-bold text-[#243447]">
                No recorded connections found for this entity.
              </h4>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                No matching entities or documented links were found for query "{activeQuery}" in case {activeCase?.id}.
              </p>
            </div>
          )}

          {/* Section 1: Direct 1-Step Connections */}
          {results.directConnections.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#243447] flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-[#3478C9]" />
                  Direct Connections (1 Step Away)
                  <Badge variant="blue">{results.directConnections.length} found</Badge>
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.directConnections.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs flex flex-col justify-between hover:border-[#9DBFD8] transition-colors"
                  >
                    <div>
                      {/* Connection Path visual */}
                      <div className="flex items-center gap-2 p-2.5 rounded bg-[#F2F7FC] border border-[#D7E4F0] text-xs">
                        <span className="font-bold text-[#243447] truncate">
                          {item.fromEntity}
                        </span>
                        <div className="flex items-center gap-1 text-[#3478C9] shrink-0 font-medium text-[11px]">
                          <span>{item.directionSymbol}</span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-[#D7E4F0]">
                            {item.relationshipType}
                          </span>
                        </div>
                        <span className="font-bold text-[#243447] truncate">
                          {item.toEntity}
                        </span>
                      </div>

                      {/* Supporting Evidence */}
                      <div className="mt-3 text-xs space-y-1.5">
                        <div>
                          <span className="font-semibold text-[#64748B] block text-[11px]">
                            Supporting Evidence:
                          </span>
                          <p className="text-[#243447] bg-white p-2 rounded border border-[#D7E4F0] leading-relaxed">
                            {item.supportingEvidence}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-[#64748B] text-[11px]">Source / Reference: </span>
                          <span className="text-[#243447]">{item.source}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#D7E4F0] flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">
                        Connected: {item.connectedEntity.category}
                      </span>
                      <button
                        onClick={() => handleSelectQuickSuggestion(item.connectedEntity.name)}
                        className="text-xs text-[#3478C9] hover:text-[#2866AE] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Explore this entity ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: 2-Step Indirect Connections */}
          {results.twoStepPaths.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#243447] flex items-center gap-2">
                  <Network className="w-4 h-4 text-violet-600" />
                  Extended Pathways (2 Steps Away)
                  <Badge variant="investigation">{results.twoStepPaths.length} discovered</Badge>
                </h4>
              </div>

              <div className="space-y-3">
                {results.twoStepPaths.map((path) => (
                  <div
                    key={path.id}
                    className="bg-white rounded-lg border border-[#D7E4F0] p-4 shadow-xs hover:border-[#9DBFD8] transition-colors"
                  >
                    {/* Visual 2-Step Flow */}
                    <div className="flex flex-wrap items-center gap-2 p-3 bg-[#F2F7FC] rounded-lg border border-[#D7E4F0] text-xs">
                      {/* Step 1 Start */}
                      <span className="font-bold text-[#243447] px-2 py-1 rounded bg-white border border-[#D7E4F0]">
                        {path.step1.from}
                      </span>

                      {/* Step 1 Edge */}
                      <div className="flex items-center gap-1 text-[#3478C9] font-medium text-[11px]">
                        <span>➔</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#EAF4FC] border border-[#B9D7F2]">
                          {path.step1.type}
                        </span>
                        <span>➔</span>
                      </div>

                      {/* Middle Node */}
                      <span className="font-bold text-[#2866AE] px-2 py-1 rounded bg-[#EAF4FC] border border-[#B9D7F2]">
                        {path.intermediateEntity.name}
                      </span>

                      {/* Step 2 Edge */}
                      <div className="flex items-center gap-1 text-violet-600 font-medium text-[11px]">
                        <span>➔</span>
                        <span className="px-1.5 py-0.5 rounded bg-violet-50 border border-violet-200">
                          {path.step2.type}
                        </span>
                        <span>➔</span>
                      </div>

                      {/* End Node */}
                      <span className="font-bold text-[#243447] px-2 py-1 rounded bg-white border border-[#D7E4F0]">
                        {path.terminalEntity.name}
                      </span>
                    </div>

                    {/* Evidentiary Details for both hops */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                      {/* Hop 1 Evidence */}
                      <div className="p-2.5 rounded bg-white border border-[#D7E4F0]">
                        <div className="font-bold text-[#3478C9] text-[11px] mb-1">
                          Hop 1 Evidence: {path.step1.from} ➔ {path.intermediateEntity.name}
                        </div>
                        <p className="text-[#243447]">{path.step1.evidence}</p>
                        <div className="text-[10px] text-[#64748B] mt-1">
                          Source: {path.step1.source}
                        </div>
                      </div>

                      {/* Hop 2 Evidence */}
                      <div className="p-2.5 rounded bg-white border border-[#D7E4F0]">
                        <div className="font-bold text-violet-700 text-[11px] mb-1">
                          Hop 2 Evidence: {path.intermediateEntity.name} ➔ {path.terminalEntity.name}
                        </div>
                        <p className="text-[#243447]">{path.step2.evidence}</p>
                        <div className="text-[10px] text-[#64748B] mt-1">
                          Source: {path.step2.source}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3 pt-2.5 border-t border-[#D7E4F0] flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">
                        Terminal Entity: {path.terminalEntity.name} ({path.terminalEntity.category})
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Network}
                        onClick={() => navigateToNetworkWithEntity(path.terminalEntity.name)}
                      >
                        Inspect in Network Graph
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty Connections State */}
          {results.searchedEntity && results.directConnections.length === 0 && (
            <div className="bg-white rounded-lg border border-[#D7E4F0] p-8 text-center">
              <h4 className="text-sm font-bold text-[#243447]">
                No recorded connections found for this entity.
              </h4>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                Entity "{results.searchedEntity.name}" exists in the evidence inventory, but no
                relational links have been logged connecting it to other entities in this case.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  icon={GitFork}
                  onClick={() => setActiveTab('evidence')}
                >
                  Log Relationship Link
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
