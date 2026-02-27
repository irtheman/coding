---
layout: post
title: 'Async Retry Action'
date: 2024-09-26 09:33:00 -0400
tags: C#
---
Let's retry a function in the background using async...

Again, Please keep in mind, this particular job had a specific rule of not allowing any third-party libraries. Everything had to be done adhoc.

## The Functions Keeps Failing Challenge
Imagine sending an email notification to a management group while making the server wait for the response from the email service. It didn't cost much but I showed that it could be done using async without await. The server could respond to the client right away without waiting to hear back from the email service. The client shouldn't really even know about the email being sent. The question from the team was, "What if the email service was down?" Well, we can log that error without telling the client. We could also try sending the email again. That is where this async retry function came into being.

__Async Retry Function__
```csharp
/// <summary>
/// Asynchronously retry a failed function
/// </summary>
/// <param name="fun">Function to execute</param>
/// <param name="RetryTimes">Number of times to retry. Default is 5.</param>
/// <param name="delayMs">Delay between retries. Default is 500ms.</param>
static async Task<T> Retry<T>(Func<Task<T>> fun, int RetryTimes = 5, int WaitTime = 500)
{
    for (int i = 0; i < RetryTimes - 1; i++)
    {
        try
        {
            return await fun();
        }
        catch (Exception Ex)
        {
            Console.WriteLine($"Retry {i + 1}: Getting Exception : {Ex.Message}");
            await Task.Delay(WaitTime);
        }
    }

    // Last try
    return await fun();
}
```

__Example__
```csharp
static async Task<string> ThisMightFail()
{
    const string notAllowed = "hello";

    await Task.Delay(500);

    Console.Write("Say something: ");
    var input = Console.ReadLine();

    if (input.Contains(notAllowed, StringComparison.OrdinalIgnoreCase))
    {
        Console.WriteLine($"You can't say '{notAllowed}'!");
        throw new ArgumentException($"You can't say '{notAllowed}'!");
    }

    return input;
}

try
{
    // Try ThisMightFail
    //   retry 3 times
    //   delay 1 second between each retry
    var result = await Retry(ThisMightFail, 3, 1000);
    Console.WriteLine(result);
}
catch (Exception ex)
{
    Console.WriteLine("Boo!");
}
```

__What It Looks Like If It Fails__
```
Say something: hello!
You can't say 'hello!'!
Retry 1: Getting Exception : You can't say 'hello!'!
Say something: hello
You can't say 'hello'!
Retry 2: Getting Exception : You can't say 'hello'!
Say something: byehello
You can't say 'byehello'!
Boo!
```

__What It Looks Like If It Succeeds__
```
Say something: hello!
You can't say 'hello!'!
Retry 1: Getting Exception : You can't say 'hello!'!
Say something: Bye!
Bye!
```

__Okay, what about parameters?__  
```csharp
static async Task<string> ThisMightFail(string p1, int p2, double p3) {...}

// Anonymous function
var result = await Retry(async () => ThisMightFail("Hello", 42, 3.14), 3, 1000);
```

[Github AsyncRetry.cs](https://github.com/irtheman/coding/blob/master/csharp/AsyncRetry.cs)
