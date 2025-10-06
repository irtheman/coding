---
layout: post
title: 'Retry Action'
date: 2024-09-25 09:33:00 -0400
tags: C#
---
Let's retry an action and maybe a function...

Keeping in mind, this particular job had a specific rule of not allowing any third-party libraries. Everything had to be done adhoc.

## The Action Keeps Failing Challenge
While working with the team, I often found that tasks would fail due to other problems outside our domain. Often this was due to the SQL server timing out which we couldn't change. There were sometimes problems where service we were relying on was slow starting up; all of our services would sleep after a mere 5 minutes.

We could just keep popping up the error notification and make the user resubmit but even I didn't like doing that myself. I came up with an idea for going ahead and retrying until there was a definite point to give up.


__A Retry Function__
```csharp
/// <summary>
/// Retry a failed action
/// </summary>
/// <param name="action">Action to perform</param>
/// <param name="numberOfRetries">Number of retries</param>
/// <param name="delayMs">Delay between reties. Default is no delay.</param>
public static void RetryAction(Action action, int numberOfRetries, int delayMs = 0)
{
    Exception? exception = null;
    int retries = 0;

    while (retries < numberOfRetries)
    {
        try
        {
            action();
            return;
        }
        catch (Exception ex)
        {
            // Ignore error
            exception = ex;
            retries++;
        }

        if (delayMs > 0)
        {
            Task.Delay(delayMs).Wait();
        }
    }

    throw exception!;
}
```

__Example__
```csharp
public static void ThisMightFail()
{
    const int notAllowed = 1;

    Console.Write("Enter a number: ");
    var input = int.Parse(Console.ReadLine() ?? "0");

    if (input == notAllowed)
    {
        Console.WriteLine($"You number must not be {notAllowed}");
        throw new ArgumentException($"You number must not be {notAllowed}");
    }

    Console.Write("Number accepted!");
}

RetryAction(ThisMightFail /* The action to retry */,
            5 /* 5 retries */,
            500 /* 1/2 second delay */);
```

__What It Looks Like If It Fails__
```
Enter a number: 1
Your number must not be 1
Enter a number: 1
Your number must not be 1
Enter a number: 1
Your number must not be 1
Enter a number: 1
Your number must not be 1
Enter a number: 1
Message: Your number must not be 1
Source: RetryActionDemo
HelpLink:
StackTrace: at RetryActionDemo.Program.Main(String[] args) in ....
```

__What It Looks Like If It Succeeds__
```
Enter a number: 1
Your number must not be 1
Enter a number: 1
Your number must not be 1
Enter a number: 1
Your number must not be 1
Enter a number: 1
Your number must not be 1
Enter a number: 2
Number accepted!
```

__Okay, what about parameters and return values...__
```csharp
public static int GetTheNumber(int notAllowed = 1)
{
    Console.Write("Enter a number: ");
    var input = int.Parse(Console.ReadLine() ?? "0");

    if (input == notAllowed)
    {
        Console.WriteLine($"You number must not be {notAllowed}");
        throw new ArgumentException($"You number must not be {notAllowed}");
    }

    Console.Write("Number accepted!");
    return input;
}

/* This is a wrapper so we can pass a parameter */
public static int ThisMightFail2()
{
    return GetTheNumber(3);
}

var res = RetryAction(ThisMightFail2 /* The action to retry */,
                      5 /* 5 retries */,
                      500 /* 1/2 second delay */);
Console.WriteLine(res);
```

__The New RetryAction__
```csharp
/// <summary>
/// Retry a failed function
/// </summary>
/// <param name="fn">Function to perform</param>
/// <param name="numberOfRetries">Number of retries</param>
/// <param name="delayMs">Delay between reties. Default is no delay.</param>
public static TResult? RetryAction<TResult>(Func<TResult> fn, int numberOfRetries, int delayMs = 0)
{
    Exception? exception = null;
    int retries = 0;

    while (retries < numberOfRetries)
    {
        try
        {
            return fn();
        }
        catch (Exception ex)
        {
            // Ignore error
            exception = ex;
            retries++;
        }

        if (delayMs > 0)
        {
            Task.Delay(delayMs).Wait();
        }
    }

    throw exception!;
}
```


__What It Looks Like If It Fails__
```
Enter a number: 3
Your number must not be 3
Enter a number: 3
Your number must not be 3
Enter a number: 3
Your number must not be 3
Enter a number: 3
Your number must not be 3
Enter a number: 3
Message: Your number must not be 3
Source: RetryActionDemo
HelpLink:
StackTrace: at RetryActionDemo.Program.Main(String[] args) in ....
```

__What It Looks Like If It Succeeds__
```
Enter a number: 3
Your number must not be 3
Enter a number: 3
Your number must not be 3
Enter a number: 3
Your number must not be 3
Enter a number: 3
Your number must not be 3
Enter a number: 1
Number accepted!
1
```
