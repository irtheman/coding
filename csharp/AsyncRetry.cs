using System.Threading.Tasks;

try
{
    var result = await Retry(ThisMightFail, 3, 1000);
    Console.WriteLine(result);
}
catch (Exception ex)
{
    Console.WriteLine("Boo Hoo!");
}

Console.ReadKey();

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
    return await fun();
}
