---
layout: post
title:  "Redis Cache"
date:   2020-10-05 15:46:25 -0400
tags: cs info
---
Redis, which stands for **Re**mote **Di**ctionary **S**erver, is a fast, open-source, in-memory key-value data store for use as a database, cache, message broker, and queue.

# What is Redis Cache?

Redis is an open-source distributed in-memory data store. We can use it as a distributed no-SQL database, as a distributed in-memory cache, or a pub/sub messaging engine. The most popular use case appears to be using it as a distributed in-memory caching engine. Redis supports a variety of data types including strings, hashes, lists, and ordered / unordered sets. Strings and hashes are the most common means for caching. There is even support for geo-spatial indexes where information can be stored by latitude and longitude. There is also a command line interface called redis-cli.exe with all the Redis features easily accessible to IT / admin. There are also a number of asynchronous versions of almost every method for accessing Redis.

# Installing Redis On Windows 10

Get the MSI binary from here: [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)

Right now, as of 10/5/2020, we are using Redis-x64-3.0.504.msi. During installation all defaults are fine with one exception: always check &quot;Add the Redis installation folder to the PATH environment variable&quot;.

![](/images/RedisPrompt.png)

Once Redis is installed there are some adjustments that may need to be made if the defaults are not sufficient. Specifically, if a password is required, the number of databases must change, a cluster is desired, TLS/SSL is needed or there is a port change then it will be necessary to edit the redis.windows-service.conf file found in the Redis installation folder:

- To change the port simply search for &quot;port&quot; and change the port number. The default is 6379.
- To change the number of databases search for &quot;databases&quot; and change the count. The default is 16.
- To change the password search for &quot;requirepass&quot; and remove the comment while setting a proper password. The default is none.
- To enable cluster search for &quot;cluster-enabled&quot; and start from there. The default is false.

# Installing Redis Client in Visual Studio

There are various Redis clients available ([https://redis.io/clients#c](https://redis.io/clients#c)) but StackExchange.Redis is the C# client recommended by RedisLabs due to its high performance and common usage ([https://docs.redislabs.com/latest/rs/references/client\_references/client\_csharp/](https://docs.redislabs.com/latest/rs/references/client_references/client_csharp/)).

For the project that will be using Redis, right-click and select &quot;Manage Nuget Packages…&quot;. Search for and install &quot;StackExchange.Redis&quot;. Alternatively, you can also use the Package Manager Console to run &quot;Install-Package StackExchange.Redis&quot;.

The documentation for StackExchange.Redis can be found on github: [https://stackexchange.github.io/StackExchange.Redis/](https://stackexchange.github.io/StackExchange.Redis/)

# Accessing Redis Using StackExchange.Redis

A using statement is required to reference StackExchange.Redis

```cs
Using StackExchange.Redis;
```

To acquire access to the Redis server a ConnectionMultiplexer Connection is required:

```cs
ConnectionMultiplexer connect = ConnectionMultiplexer.Connect("hostname:port,password=password");
```

The ConnectionMultiplexer should not be created per operation. Create it once and reuse it.

With the connection to Redis one needs access to the Redis database where caching will take place:

```cs
IDatabase conn = muxer.GetDatabase();
```

The default database is 0. The default provides up to 16. The number can be changed in the config file. One idea might be to use a separate database per Tenant to keep things separated.

# Configuration of StackExchange.Redis

As seen above, the ConnectionMultiplexer can be initialized with a parameter string. The many options can be found in the documentation ([https://stackexchange.github.io/StackExchange.Redis/Configuration](https://stackexchange.github.io/StackExchange.Redis/Configuration)). Each option is simply separated by commas like this:

```cs
var conn = ConnectionMultiplexer.Connect("redis0:6380,redis1:6380,allowAdmin=true");
```

It starts with the main Redis server, then any cluster servers that the client should know about, and then other options follow. AllowAdmin isn&#39;t really recommended though it does expand on what the Redis client can do.

Another configuration option is to convert the parameter string into a ConfigurationOptions object:

```cs
ConfigurationOptions options = ConfigurationOptions.Parse(configString);
```

Or one can simply go straight to using the ConfigurationOptions object directly:

```cs
ConfigurationOptions config = new ConfigurationOptions("localhost")
 {
   KeepAlive = 180,
   Password = "changeme"
 };
 ```

# Caching with StackExchange.Redis

Once you have a ConnectionMultiplexer you can then acquire access to a database. Any will do but database 0 is default. The database object provides the caching options. There are various means of caching in Redis but the simplest and most useful for TraQ7 was to use the String methods, StringSet and StringGet, like the following:

```cs
// Store and re-use ConnectionMultiplexer. Dispose only when no longer used.
 ConnectionMultiplexer conn = ConnectionMultiplexer.Connect("localhost");
 IDatabase db = conn.GetDatabase();
 ...
 string value = "Some Value";
 db.StringSet("key1", value);
 ...
 string value = db.StringGet("key1");
 ...
 ```

Storing and retrieving a string value is easy and was the earliest primary function of Redis for caching.

# Searching Redis Keys

Redis has KEY and SCAN keywords in the CLI for looking up database keys. KEY is typically not recommended in production, but SCAN is considered safe. The StackExchange.Redis client makes the decision on which Redis command to execute for best performance. KEY / SCAN supports glob-style pattern matching which is not the same as RegEx. Glob-style patterns look more like a Linux file search that includes the following patterns (use &#39; for escape):

- h?llo matches hello, hallo, hxllo, etc
- h\*llo matches hllo, heeeeello, etc.
- h[ae]llo matches hello and hallo but not anything else like hillo
- h[^e]llo matches hallo, hbllo, etc but not hello
- h[a-c]llo matches hallo, hbllo and hcllo

To search for a specific key(s) you need a server object representing the host or maintenance Redis instance. Then a search based on pattern matching can be applied:

```cs
 string pattern = "DataTable"
 var server = conn.GetServer("localhost");
 var cacheKeys = server.Keys(pattern:$"\*{pattern}\*");
```

# Deleting Redis Keys

Keys can be deleted individually or as a whole set:

```cs
 // Delete a single key
 Database.KeyDelete(&quot;Key1&quot;);

 // Delete all keys from database 0
 server.FlushDatabase(0);
```

# Serialization of Redis Values

StackExchange.Redis always changes all RedisValue being cached that is not a primitive datatype to a byte array. This is handled in TraQ7 Redis Caching to speed up the process by skipping calls to multiple methods. It is also necessary to specify a JSON setting to preserve all references to help prevent errors due to cycles in the objects being serialized.

```cs
 readonly Encoding _encoding = Encoding.UTF8;
 JsonSerializerSettings _jsonSettings = new JsonSerializerSettings() { PreserveReferencesHandling = PreserveReferencesHandling.Objects };
 ...
 private byte[] Serialize(object item)
 {
  var type = item?.GetType();
  var jsonString = JsonConvert.SerializeObject(item, type, _jsonSettings);
  return _encoding.GetBytes(jsonString);
 }

 private T Deserialize\&lt;T\&gt;(byte[] serializedObject)
 {
   if (serializedObject == null || serializedObject.Length == 0)
     return default(T);
   var jsonString = _encoding.GetString(serializedObject);
   return JsonConvert.DeserializeObject<T>(jsonString, _jsonSettings);
}
```

# Notes:

- Make cache services into Singletons at Startup (helps Redis most)
- Convert serialized objects to byte arrays for faster transaction
- Use JSON setting PreserveReferencesHandling = PreserveReferencesHandling.Objects to enable serializing complex objects with circular references
- Redis Keys search pattern is NOT RegEx. Excluding whole words seem to not be possible.
- Clear the Redis cache when any changes are made to the structure of any classes that are serialized.
  - Redis-cli.exe FLUSHDB
  - Redis-cli.exe FLUSHALL
  - These work inside the redis-cli client as well.