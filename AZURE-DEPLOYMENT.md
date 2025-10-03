# Azure Functions Deployment Guide

## 🚀 **Deploy IntentGraph MCP Server to Azure Functions**

This is the **recommended** way to integrate with Copilot Studio, as Azure Functions is part of the Microsoft ecosystem and integrates seamlessly with Power Platform.

---

## **Why Azure Functions?**

✅ **Serverless** - No infrastructure to manage  
✅ **Integrated** - Native Microsoft ecosystem  
✅ **Scalable** - Auto-scales with demand  
✅ **Cost-effective** - Pay per execution  
✅ **Built-in monitoring** - Application Insights included  
✅ **Power Platform friendly** - Easy connector setup  

---

## **Prerequisites**

1. **Azure Subscription** ([Get free trial](https://azure.microsoft.com/free/))
2. **Azure CLI** installed ([Install guide](https://docs.microsoft.com/cli/azure/install-azure-cli))
3. **Node.js 18+** installed
4. **LLM API Key** (Writer, OpenAI, or Anthropic)

---

## **Step 1: Prepare for Deployment**

### **1.1 Build the project**

```powershell
cd C:\Users\seanp\projects\IntentGraphGen
npm run build
```

### **1.2 Login to Azure**

```powershell
az login
```

---

## **Step 2: Create Azure Resources**

### **2.1 Create Resource Group**

```powershell
$RESOURCE_GROUP="intent-graph-rg"
$LOCATION="eastus"

az group create --name $RESOURCE_GROUP --location $LOCATION
```

### **2.2 Create Storage Account** (required for Functions)

```powershell
$STORAGE_NAME="intentgraphstorage$(Get-Random -Minimum 1000 -Maximum 9999)"

az storage account create `
  --name $STORAGE_NAME `
  --location $LOCATION `
  --resource-group $RESOURCE_GROUP `
  --sku Standard_LRS
```

### **2.3 Create Function App**

```powershell
$FUNCTION_APP_NAME="intent-graph-mcp"

az functionapp create `
  --resource-group $RESOURCE_GROUP `
  --consumption-plan-location $LOCATION `
  --runtime node `
  --runtime-version 18 `
  --functions-version 4 `
  --name $FUNCTION_APP_NAME `
  --storage-account $STORAGE_NAME
```

---

## **Step 3: Configure Environment Variables**

### **3.1 Set LLM Configuration**

```powershell
# For Writer Palmyra (recommended)
az functionapp config appsettings set `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings `
    "LLM_API_KEY=your-writer-api-key" `
    "LLM_MODEL=palmyra-x5" `
    "LLM_BASE_URL=https://api.writer.com"

# OR for OpenAI
az functionapp config appsettings set `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings `
    "LLM_API_KEY=your-openai-key" `
    "LLM_MODEL=gpt-4" `
    "LLM_BASE_URL=https://api.openai.com/v1"

# OR for Claude
az functionapp config appsettings set `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings `
    "LLM_API_KEY=your-anthropic-key" `
    "LLM_MODEL=claude-3-5-sonnet-20241022" `
    "LLM_BASE_URL=https://api.anthropic.com/v1"
```

---

## **Step 4: Deploy the Code**

### **4.1 Create deployment package**

```powershell
# Create a zip file with all necessary files
Compress-Archive -Path `
  build, `
  azure-function, `
  node_modules, `
  package.json, `
  package-lock.json `
  -DestinationPath deploy.zip -Force
```

### **4.2 Deploy to Azure**

```powershell
az functionapp deployment source config-zip `
  --resource-group $RESOURCE_GROUP `
  --name $FUNCTION_APP_NAME `
  --src deploy.zip
```

### **4.3 Wait for deployment** (about 2-3 minutes)

```powershell
Start-Sleep -Seconds 180
```

---

## **Step 5: Get Your Function URL**

```powershell
$FUNCTION_URL = az functionapp show `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --query "defaultHostName" `
  --output tsv

Write-Host "Your MCP endpoint is: https://$FUNCTION_URL/api/mcp"
Write-Host "Your health check is: https://$FUNCTION_URL/api/health"
```

---

## **Step 6: Test the Deployment**

### **6.1 Test health endpoint**

```powershell
curl "https://$FUNCTION_URL/api/health"
```

**Expected response**:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "server": "IntentGraph MCP Server",
  "transport": "streamable",
  "platform": "Azure Functions",
  "tools": 7
}
```

### **6.2 Test MCP endpoint**

```powershell
$body = @{
  jsonrpc = "2.0"
  id = "1"
  method = "tools/list"
  params = @{}
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://$FUNCTION_URL/api/mcp" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

---

## **Step 7: Connect to Copilot Studio**

### **7.1 Get your Function Key**

```powershell
$FUNCTION_KEY = az functionapp function keys list `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --function-name mcp-endpoint `
  --query "default" `
  --output tsv

Write-Host "Your Function Key: $FUNCTION_KEY"
```

### **7.2 In Copilot Studio:**

1. Go to https://copilotstudio.microsoft.com
2. Select your Copilot → **Tools** → **Add a tool** → **New tool**
3. Select **Model Context Protocol**

Fill in:
- **Server name**: `intent-graph-generator`
- **Server description**: `Generates AI-powered intent graphs for orchestrating multi-agent workflows. Takes user requests and available agents, returns complete workflow graphs.`
- **Server URL**: `https://<your-function-url>/api/mcp?code=<function-key>`
- **Authentication**: **No authentication** (key is in URL)

### **7.3 Alternative: Use API Key Auth**

For cleaner URLs, configure API key authentication:

```powershell
# Enable API key header authentication
az functionapp config appsettings set `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings "API_KEY=your-custom-api-key"
```

Then in Copilot Studio:
- **Server URL**: `https://<your-function-url>/api/mcp`
- **Authentication**: **API key**
- **API Key**: `your-custom-api-key`

---

## **Step 8: Update OpenAPI Schema**

### **8.1 Update the schema file**

Edit `copilot-studio-schema.yaml`:

```yaml
host: <your-function-url>
basePath: /api
```

### **8.2 Import to Copilot Studio** (Alternative method)

If you prefer custom connector:
1. **Tools** → **New tool** → **Custom connector**
2. **Import OpenAPI file**
3. Upload `copilot-studio-schema.yaml`

---

## **Monitoring & Troubleshooting**

### **View Logs**

```powershell
# Stream live logs
az webapp log tail `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP

# View in Azure Portal
az functionapp show `
  --name $FUNCTION_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --query "defaultHostName" `
  --output tsv
```

Then visit: `https://portal.azure.com` → Function App → Monitor → Application Insights

### **Common Issues**

#### **502 Bad Gateway**
- Function is cold starting (wait 10-30 seconds)
- Check Application Insights for errors

#### **401 Unauthorized**
- Function key is missing or incorrect
- Check URL has `?code=<key>` or header has API key

#### **500 Internal Server Error**
- Check LLM API key is set correctly
- View logs in Application Insights

---

## **Cost Estimation**

Azure Functions pricing (Consumption Plan):

| Usage | Estimated Cost |
|-------|----------------|
| 1,000 executions/month | **Free** (Free tier includes 1M executions) |
| 10,000 executions/month | **~$0.20/month** |
| 100,000 executions/month | **~$2.00/month** |

Plus LLM API costs (Writer Palmyra, OpenAI, etc.)

---

## **Production Checklist**

- [ ] Enable **Application Insights** monitoring
- [ ] Set up **alerts** for errors
- [ ] Configure **API Management** for rate limiting (optional)
- [ ] Enable **authentication** (API key or OAuth)
- [ ] Set up **CI/CD** with GitHub Actions or Azure DevOps
- [ ] Configure **CORS** for specific domains (instead of `*`)
- [ ] Enable **diagnostic logging**
- [ ] Set up **backup LLM provider** (optional)
- [ ] Document your Function URL for team
- [ ] Test failover scenarios

---

## **Updating the Function**

To deploy updates:

```powershell
# 1. Build
npm run build

# 2. Package
Compress-Archive -Path build, azure-function, node_modules, package.json -DestinationPath deploy.zip -Force

# 3. Deploy
az functionapp deployment source config-zip `
  --resource-group $RESOURCE_GROUP `
  --name $FUNCTION_APP_NAME `
  --src deploy.zip
```

---

## **Clean Up Resources**

To delete everything:

```powershell
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

---

## **Alternative: Azure Web App**

If you prefer a full web server instead of Functions:

```powershell
# Create App Service Plan
az appservice plan create `
  --name intent-graph-plan `
  --resource-group $RESOURCE_GROUP `
  --sku B1 `
  --is-linux

# Create Web App
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan intent-graph-plan `
  --name intent-graph-web `
  --runtime "NODE:18-lts"

# Deploy
npm run build
zip -r deploy.zip .
az webapp deployment source config-zip `
  --resource-group $RESOURCE_GROUP `
  --name intent-graph-web `
  --src deploy.zip

# Set startup command
az webapp config set `
  --resource-group $RESOURCE_GROUP `
  --name intent-graph-web `
  --startup-file "npm run start:http"
```

---

## **Resources**

- **Azure Functions Documentation**: https://docs.microsoft.com/azure/azure-functions/
- **Copilot Studio MCP Integration**: https://docs.microsoft.com/microsoft-copilot-studio/
- **Application Insights**: https://docs.microsoft.com/azure/azure-monitor/app/app-insights-overview
- **GitHub Repository**: https://github.com/spoyner/intent-graph-generator

---

**Need help?** Contact: sean.poyner@pm.me

