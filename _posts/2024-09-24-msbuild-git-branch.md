---
layout: post
title: 'Using A Git Branch In MSBuild'
date: 2024-09-23 09:33:00 -0400
tags: C# Git Drama
---
## Project Deployment Challenge

### I'm just sharing experiences

I’ve worked with many teams and my role was mostly as a helper and problem solver. This is what I actually enjoy about my work. Well, that and ETL.

In a new job, I discovered that there was no indication on the server as to what stage of deployment the project was in. Yes, each deployment went to a different server based on the git branch but there was nothing on the server saying what the environment was. This meant I couldn't use the typical variety of AppSettings configurations. I found that even web.config was blocked on deployment. I asked if we could fix this and the CI/CD pipeline manager said he had no idea how to do that or why it would even be needed. He even advised just modifying the program.cs for each deployment.

<div class="notice" markdown="1">
#### Note
IIS servers do allow configuration of environment variables. An environment variable can also be configured using web.config if it isn't blocked on the server.
</div>

### Why is this environment variable important?
So, why would this matter? Well, environment variables, like _EnvironmentName_, can decide what the server environment is going to be like. This can also be used to determine what actions to take in that environment or even provide secret information only the server admin knows.

Like many already do, we should have had different AppSettings configurations to configure each application for it's current environment. The AppSettings configuration can include things like the application version, what database to use for that stage, where to send the “error” warning email to, where to send the automated application emails, who is to be the initial administrator, where to store files locally, etc. Basically, up until I found a workaround, we had put everything into one appsettings.json for all stages and the project.cs code had to be modified for each deployment. What could go wrong with that?

My AppSettings suggestions were based on Microsoft’s Learning website…

* appsettings.development.json - A developers environment would be radically different as the developer would be using a different database (locally), they might want to disable the application emails being sent out, who the application admin was (the developer obviously), where to store the local files, and more.

* appsettings.stage.json – The stage environment would be nothing like the developers environment but it should work just like the producation environment. It would of course have it’s own database, some emails might be different, and storing the files would be in a different place on that server.

* appsettings.production.json – The production environment would be like the stage environment only far more stable. The application server and the database servers should have been faster and more stable as well. Experiments should not have been happening in this environment because they would throw the user’s into appropriate tantrums.

One of these AppSettings versions would be chosen based on the _EnvironmentName_ environment variable.

### My project hack
I made a fun change to each of the projects so the proper AppSettings configuration would be used on deployment. It did take the team a while to adjust but the code got a lot cleaner and the deployments were more stable.

Here is the MSBuild modification I made:

**Something.csproj**
```xml
  <PropertyGroup>
    <GitBranch>
       $([System.IO.File]::ReadAllText('$(MSBuildThisFileDirectory)..\..\.git\HEAD').Replace('ref: refs/heads/', '').Trim())
    </GitBranch>
  </PropertyGroup>

   <Choose>
      <WhenCondition="'$(GitBranch)'=='main'And'$(Configuration)'=='Release'">
         <PropertyGroup>
            <EnvironmentName>Production</EnvironmentName>
         </PropertyGroup>
      </WhenCondition=>
      <WhenCondition="'$(GitBranch)'=='develop'And'$(Configuration)'=='Release'">
         <PropertyGroup>
            <EnvironmentName>Staging</EnvironmentName>
         </PropertyGroup>
      </WhenCondition=>
      <Otherwise>
         <PropertyGroup>
            <EnvironmentName>Development</EnvironmentName>
         </PropertyGroup>
      </Otherwise>
   </Choose>
```
What is happening here is that, in **GitBranch**, I'm having MSBuild look for the .git folder and then read the HEAD file. Using the String.Replace() function, 'ref: refs/heads/' is removed leaving just the branch name. The branch name is trimmed and then stored in the **GitBranch** custom property.

**Choose** is a feature MSBuild supports in csproj files and it lets the developer make a choice based on the property being used. In this project, 'main' was used for production, 'develop' was used for stage, and thus anything not 'Release' would be a 'Development' environment. The **WhenCondition** simply evaluates **GitBranch** and **Configuration** as strings and compares them to the conditions that should be met. When chosen, the _EnvironmentName_ environment variable gets set. It is basically like a C# switch statement or expression.

```csharp
Environment.SetEnvironmentVariable("EnvironmentName",
  (GitBranch, Configuration) switch
  {
    ("main", "Release") => "Production",
    ("develop", "Release") => "Staging",
    _ => "Development"
  });
}
```

While the rest of the team were getting paid more than I was, I admit that I was hired to help them fix problems and help migrate old applications. I love helping and I’m not criticizing the team here, though it might sound like it. I like helping a team that listens.
