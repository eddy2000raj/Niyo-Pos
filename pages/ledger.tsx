import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import Empty from '../components/Empty';
import Card from '../components/ledger/Card';
import Filter from '../components/ledger/Filter';
import Sidebar from '../components/ledger/Sidebar';
import ListItem from '../components/ledger/ListItem';
import useLedger from '../hooks/useLedger';
import Page from '../layouts/Page';
import styled from 'styled-components';

const LedgerBody = styled.div`
  .ledger-header {
    position: sticky;
    top: -10px;
    background: #f5f5f5;
    margin-bottom: 15px !important;
    .hr:not(:first-child) {
      padding: 0 !important;
    }
    .refresh-button {
      cursor: pointer;
    }

    .refresh-button:hover {
      transform: scale(1.1);
    }

    .refresh-button:active {
      transform: scale(1);
    }
  }
`;

const LedgerPage = () => {
  const initialQuery = {
    page: 1,
    start_date: moment().startOf('month').format('YYYY-MM-DD'),
    end_date: moment().endOf('day').format('YYYY-MM-DD'),
    filters: [],
  };
  const { results, ledgerFilters, query, setQuery, loading, hasMore, balance } =
    useLedger(initialQuery);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [ledgerFiltersSettings, setLedgerFiltersSettings] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && hasMore) {
      let isExecuted = false;
      itemsRef.current.onscroll = () => {
        if (!isExecuted) {
          const scrollHeight = itemsRef.current.scrollHeight;
          const visibleHeight = itemsRef.current.offsetHeight;
          const neededOffset = 200;
          if (
            itemsRef.current.scrollTop + neededOffset >
            scrollHeight - visibleHeight
          ) {
            isExecuted = true;
            setQuery({ ...query, page: query.page + 1 });
          }
        }
      };
    }

    if (Object.keys(ledgerFiltersSettings).length === 0) {
      setLedgerFiltersSettings(ledgerFilters);
    }
    const itemCurrent = itemsRef.current;
    if (itemCurrent !== null) {
      return () => (itemCurrent.onscroll = null);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    const ledgerFiltersUpdated = [];

    for (const item of ledgerFilters) {
      ledgerFiltersUpdated[item.key] = { ...item, enabled: false };
    }

    setLedgerFiltersSettings(ledgerFiltersUpdated);
  }, []);

  const applyLedgerSettings = settings => {
    setLedgerFiltersSettings(settings);
    let appliedFilters = [];
    let appliedFiltersNames = [];

    for (const key of Object.keys(settings)) {
      if (settings[key].enabled) {
        appliedFilters.push(settings[key].key);
        appliedFiltersNames.push(settings[key].name);
      }
    }
    setAppliedFilters(appliedFiltersNames);
    setQuery({ ...query, page: 1, filters: appliedFilters });
    setToggleSidebar(false);
  };
  const resetFliter = () => {
    setAppliedFilters([]);
    setLedgerFiltersSettings(ledgerFilters);
    setQuery({
      ...initialQuery,
      start_date: query.start_date,
      end_date: query.end_date,
    });
  };
  return (
    <Page>
      {toggleSidebar && (
        <Sidebar
          items={ledgerFiltersSettings}
          toggle={toggleSidebar}
          onToggle={setToggleSidebar}
          onApply={applyLedgerSettings}
        />
      )}

      <div className="grid pv-md">
        <h1 className="lg bold col-6">LEDGER</h1>
        <Filter query={query} setQuery={setQuery} />
      </div>
      <LedgerBody className="grow col items p-sm" ref={itemsRef}>
        <Card balance={balance} />

        <div className="grid gutter-md mt-lg bold ledger-header">
          {appliedFilters.length > 0 && (
            <div className="col-12">
              <div
                style={{
                  background: '#fff',
                  padding: '10px 10px',
                  borderRadius: 4,
                }}
              >
                <h5 style={{ fontSize: 14, fontWeight: 600 }}>
                  Applied Filters{' '}
                  <span style={{ float: 'right' }}>
                    <i
                      onClick={() => resetFliter()}
                      className="fa fa-undo refresh-button"
                      aria-hidden="true"
                    ></i>
                  </span>
                </h5>
                <div className="col-12">
                  <hr className="hr light mt-sm" />
                </div>
                <div style={{ marginTop: 10 }}>
                  {appliedFilters.map((value, index) => (
                    <span
                      key={index}
                      className="tag"
                      style={{ marginLeft: 15 }}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {appliedFilters.length === 0 && (
            <div className="hr dark col-12"></div>
          )}

          <div className="col-3">Date</div>
          <div className="col-3">
            Details{' '}
            <i
              className="fas fa-filter fa-lg"
              onClick={() => setToggleSidebar(true)}
              style={{ cursor: 'pointer' }}
            ></i>
          </div>
          <div className="col-2 center">Credit</div>
          <div className="col-2 center">Debit</div>
          <div className="col-2 center">Balance</div>
          <div className="hr dark col-12"></div>
        </div>
        {!(loading && query.page == 1) &&
          results?.map((item, key) => {
            return <ListItem item={item} key={key} />;
          })}

        {results?.length === 0 && !loading && <Empty />}

        <div className="center mt-md col-12">
          {loading && <i className="fas fa-sync fa-spin"></i>}
        </div>
      </LedgerBody>
    </Page>
  );
};

export default LedgerPage;
