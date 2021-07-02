import { useSimpleReducer } from './index';
import { renderHook, act } from '@testing-library/react-hooks'


async function addToState(state: {count: number}, num: number) {;
  return {count: state.count + num};
}

async function subtractFromState(state: {count: number}, num: number) {

  return {count: state.count - num};
}


test('basics', async () => {

  const {result, waitForNextUpdate}  = renderHook(
      () => useSimpleReducer({count: 0},{
        add: addToState,
        subtract: subtractFromState
      })
    )

  let [currentState, {add, subtract}] = result.current;

  expect(currentState.count).toBe(0);

  // processing update
  act( ()=>  add(2) );

  await waitForNextUpdate();

  [currentState, {subtract}] = result.current;

  expect(currentState.count).toBe(2);

  act( ()=>  subtract(1) );

  await waitForNextUpdate();

  [currentState, {add, subtract}] = result.current;

  expect(currentState.count).toBe(1);

});


test('queing', async ()=> {

  const {result, waitForNextUpdate}  = renderHook(
    () => useSimpleReducer({count: 0},{
      add: addToState,
      subtract: subtractFromState
    })
  )

  let [currentState, {add, subtract}] = result.current;

  expect(currentState.count).toBe(0);

  // processing update
  act( ()=> { 
    add(2); 
    subtract(1); 
  } );

  await waitForNextUpdate();

  [currentState, {add, subtract}] = result.current;

  expect(currentState.count).toBe(1);


});

