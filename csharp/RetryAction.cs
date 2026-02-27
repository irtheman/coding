using System.Threading.Tasks;


/*
RetryAction(ThisMightFail, 3, 1000);
*/

var res = RetryAction(ThisMightFail2, 3, 1000);
Console.WriteLine(res);

/// Retry a failed action
/// </summary>
/// <param name="action">Action to perform</param>
/// <param name="numberOfRetries">Number of retries</param>
/// <param name="delayMs">Delay between reties. Default is no delay.</param>
static void RetryAction(Action action, int numberOfRetries, int delayMs = 0)
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

/// <summary>
/// Retry a failed function
/// </summary>
/// <param name="fn">Function to perform</param>
/// <param name="numberOfRetries">Number of retries</param>
/// <param name="delayMs">Delay between reties. Default is no delay.</param>
static TResult? RetryAction<TResult>(Func<TResult> fn, int numberOfRetries, int delayMs = 0)
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

static int GetTheNumber(int notAllowed = 1)
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
static int ThisMightFail2()
{
    return GetTheNumber(3);
}

/*
static void ThisMightFail()
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
*/
