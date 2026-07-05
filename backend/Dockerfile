# BUILD STAGE, new image
# start from big full .NET, set /src as working folder
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files first and restore, so Docker can cache this layer
# skips redownloading NuGet packages on every code change (future proofing stuff)
COPY MoneyMovement.Domain/*.csproj MoneyMovement.Domain/
COPY MoneyMovement.Application/*.csproj MoneyMovement.Application/
COPY MoneyMovement.Infrastructure/*.csproj MoneyMovement.Infrastructure/
COPY MoneyMovement.Api/*.csproj MoneyMovement.Api/
RUN dotnet restore MoneyMovement.Api/MoneyMovement.Api.csproj

# copies everything else, actual scource code and compiles solution in Release mode
# published into /app, no restore to skip since we did it above
COPY . .
RUN dotnet publish MoneyMovement.Api/MoneyMovement.Api.csproj -c Release -o /app --no-restore

# RUNTIME STAGE, new image
# will only contain small ASP.NET runtime image rather than above which contains full SDK (large compilers, build tools) which will be hefty when running in production if kept
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
# Reaches into /app from the previous stage and only copies that compiled output
COPY --from=build /app .

# Security feature, non-privileged user and switches to it
# limits damage if an attacker were to execute code inside container
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# tells ASP.NET to listen on port 8080 in the container
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
# actual startup command, runs when container starts
ENTRYPOINT ["dotnet", "MoneyMovement.Api.dll"]
