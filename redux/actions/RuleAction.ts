import Toolkit from '../../utils/Toolkit';
import DB from '../../utils/database/DB';
import AppActions from './AppAction';
import { SyncName, SyncStatus } from '../../types/Sync';
import RuleApi from '../../apis/RuleApi';
import { ThunkyAction } from '../store';

const syncFromServer = (): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    const apiProps = Toolkit.mapStateToApiProps(getState());
    const sync = getState().appState.syncs[SyncName.RULE_SERVER];
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(
          AppActions.updateSync(SyncName.RULE_SERVER, SyncStatus.IN_PROGRESS)
        );
        await DB.rules.clear();
        let page = 0;
        let totalPages = 1;
        const per_page = 500;
        const timestamp = sync ? sync.timestamp : null;
        do {
          page++;
          const response = await new RuleApi(apiProps).fetch({
            page,
            per_page,
            timestamp,
          });
          totalPages = response.data.meta.last_page;
          const rules = response.data.data;
          await DB.rules.bulkPut(rules);
        } while (page < totalPages);
        dispatch(
          AppActions.updateSync(SyncName.RULE_SERVER, SyncStatus.COMPLETED)
        );
      } catch (error) {
        dispatch(
          AppActions.updateSync(SyncName.RULE_SERVER, SyncStatus.FAILED)
        );
      }
    }
  };
};

const syncFromServerBySocket = (rules: any): ThunkyAction<Promise<any>> => {
  return async (dispatch, getState) => {
    //const apiProps = Toolkit.mapStateToApiProps(getState());
    const sync = getState().appState.syncs[SyncName.RULE_SERVER];
    console.log(
      '**** Lenght of Rules fetched from server = ' + rules.results.length
    );
    if (!sync || sync.status !== SyncStatus.IN_PROGRESS) {
      try {
        dispatch(
          AppActions.updateSync(SyncName.RULE_SERVER, SyncStatus.IN_PROGRESS)
        );

        await DB.rules.bulkPut(rules.results);
        dispatch(
          AppActions.updateSync(
            SyncName.RULE_SERVER,
            SyncStatus.COMPLETED,
            rules.last_updated_at
          )
        );
      } catch (error) {
        if (error.message === 'Network Error')
          dispatch(AppActions.updateNetworkError(true));
        console.error(error);
        dispatch(
          AppActions.updateSync(SyncName.RULE_SERVER, SyncStatus.FAILED)
        );
      }
    }
  };
};

export default { syncFromServer, syncFromServerBySocket };
