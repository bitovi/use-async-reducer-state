# use-simple-reducer

[![Build](https://img.shields.io/github/workflow/status/bitovi/use-simple-reducer/Build%20and%20Test%20Library?style=plastic)](https://github.com/bitovi/use-simple-reducer/actions/workflows/build_test_library.yml)
[![Version](https://img.shields.io/npm/v/@bitovi/use-simple-reducer?style=plastic)](https://www.npmjs.com/package/@bitovi/use-simple-reducer)
[![Types](https://img.shields.io/npm/types/@bitovi/use-simple-reducer?style=plastic)](https://www.npmjs.com/package/@bitovi/use-simple-reducer)
[![Size](https://img.shields.io/bundlephobia/min/@bitovi/use-simple-reducer?style=plastic)](https://www.npmjs.com/package/@bitovi/use-simple-reducer)
[![Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen.svg?style=flat)](https://www.npmjs.com/package/@bitovi/use-simple-reducer)
[![Pull Requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com/)

`useSimpleReducer` is a simple async state mechanism for ReactJS. It's
designed to be used for managing service state data and result in easy-to-test reducer methods.

## Need help or have questions?

This project is supported by [Bitovi, an end-to-end JavaScript consultancy](https://www.bitovi.com/frontend-javascript-consulting/react-consulting) specializing in React. You can get help or ask questions on our:

- [Slack Community](https://www.bitovi.com/community/slack)
- [Twitter](https://twitter.com/bitovi)

Or, you can hire us for training, consulting, or development. [Set up a free consultation.](https://www.bitovi.com/frontend-javascript-consulting/react-consulting)

## Table of Contents

- [Install](#install)
- [The Hook](#the-hook)
- [The Queue](#the-queue)
- [Error Handling](#error-handling)
- [Demonstration](#demonstration)

<a id="install"/>

## Install

```
npm i @bitovi/use-simple-reducer
```

<a id="the-hook"/>

## The Hook

#### Use

In your component, call `useSimpleReducer` with:

| Field          | Type                                                     | Purpose                                                                                                                                                                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialState` | any                                                      | The initial state you want to manage.                                                                                                                                                                                                                                                                                                              |
| `actions`      | {[key: string]: </br> (state: any, payload: any) => any} | A collection of reducer methods, each to be called with </br> the`state` as the first argument and values passed to </br> the `action` method as the second argument. If you are </br> unfamiliar with the reducer pattern you can check out </br> the [redux reducer](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers). |

```ts
function Counter() {
  const [state, actions, queue, error] = useSimpleReducer(
    // initial state
    { count: 0 },
    // collection of reducer methods
    {
      async add(state: CounterState, amountToAdd: number) {
        await updateCountOnServer(state.count + amountToAdd);
        return { ...state, count: state.count + amountToAdd };
      },
      async subtract(state: CounterState, amountToSubtract: number) {
        await updateCountOnServer(state.count - amountToSubtract);
        return { ...state, count: state.count - amountToSubtract };
      },
    },
  );
}
```

`useSimpleReducer` returns:

| Field     | Type                                                                                            | Purpose                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`   | {[key: string]: any}                                                                            | The latest state. This will initially return the initial state value, </br> then it will return the values returned by the reducer methods. |
| `queue`   | { isActive: boolean, </br> pendingAction: ActionAndArgs[], </br> runningAction : ActionAndArgs} | The queue's state, whether it is still active and details of </br> the running and pending actions in the queue.                            |
| `actions` | {[key: string]: (arg: any) => void}                                                             | An object of methods that can be used to update the state.                                                                                  |
| `error`   | Error \| null                                                                                   | An error that is returned if any of the actions fail, `null` </br> if otherwise.                                                            |

When the user interacts with the page, call the `actions` methods. For example,
you might call `actions.add` and `actions.subtract` as follows:

```jsx
return (
  <div>
    <button onClick={() => actions.add(2)}>Two Steps Forward</button>
    <button onClick={() => actions.subtract(1)}>One Step Back</button>
    <div>
      <p>Steps: {state.count}</p>
      <div>{queue.isActive ? <Loader /> : 'Processing completed'}</div>
    </div>
  </div>
);
```

The argument being passed to `actions` methods here `actions.add(2)` should match the type of the payload argument `amountToAdd` being passed to the reducer method `async add (state, amountToAdd)`

```ts
async add(state: CounterState, amountToAdd: number){
    return { ...state, count: state.count + amountToAdd };
}
```

<a id="the-queue"/>

## The Queue

Any invoked reducer action gets added to a queue. The queue will then start processing those asynchrous actions in the same order they have been added. The `isActive` flag gets set to `false` once all actions has been processed.

#### Interface

| Field            | Type            | Purpose                                                                                                                                 |
| ---------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `isActive`       | boolean         | `true` if an async action is running, `false` if otherwise. This can be used to add loading, spinners or other UI elements to the page. |
| `runningAction`  | ActionAndArgs   | Details of the running action which include the action's name, method and arguments.                                                    |
| `pendingActions` | ActionAndArgs[] | An Array of details of the pending actions in the queue which include the actions' names, methods and arguments.                        |

<a id="error-handling"/>

## Error Handling

An error object gets returned if any of the reducer methods fails. The cause of the error, details of the failed action and some error handling methods are exposed as part of the object.

#### Use

```jsx
    return (
        <div>
            <button onClick={()=> actions.add(2)}>Two Steps Forward</button>
            <button onClick={()=> actions.subtract(1)}>One Step Back</button>
            <div>
                <p>Steps: {state.count}</p>
                <div>{queue.isActive ? <Loader /> : "Processing completed"}</div>
            </div>
            {error && <AlertDialog content={error.reason} onConfirm={() => error.runFailedAction()} />}
        </div>
    );
}
```

#### Interface

The `error` could contain the following fields:

| Field               | Type            | Purpose                                                                                                              |
| ------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| `reason`            | any             | The cause of the error. This can be of any type depending on the error thrown.                                       |
| `failedAction`      | ActionAndArgs   | Details of the failed action which include the action's name, method and arguments.                                  |
| `pendingActions`    | ActionAndArgs[] | An array of the details of the pending actions in the queue which include the actions' names, methods and arguments. |
| `runFailedAction`   | () => void      | An error recovery method to re-run the last failed action.                                                           |
| `runPendingActions` | () => void      | An error recovery method to skip the failed action and only run the pending actions in the queue.                    |
| `runAllActions`     | () => void      | An error recovery method to re-run the failed action and all the pending actions in the queue.                       |

Unless the user calls any of the error recovery methods listed above, a default behaviour of the queue is to clear the failed and pending actions in it once an error occurs.

<a id="demonstration"/>

## Demonstration

CodeSandBox:

> https://codesandbox.io/s/gifted-elbakyan-g31c3

# We want to hear from you.

Come chat with us about open source in our community [Slack](https://www.bitovi.com/community/slack).

See what we're up to by following us on [Twitter](https://twitter.com/bitovi).
