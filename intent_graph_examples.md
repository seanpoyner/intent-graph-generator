# Intent Graph Generator - Examples

## Example 1: Simple Sequential Workflow
**Use Case:** Customer order processing with validation, inventory check, and payment.

### Request:
```json
{
  "jsonrpc": "2.0",
  "method": "generate_graph",
  "id": "req_001",
  "params": {
    "agent_purpose": "Process a customer order from validation through payment confirmation",
    "available_agents": [
      {
        "name": "OrderValidator",
        "type": "validator",
        "capabilities": ["validate_order_schema", "check_required_fields"],
        "input_schema": {"order_data": "object"},
        "output_schema": {"is_valid": "boolean", "errors": "array", "validated_order": "object"}
      },
      {
        "name": "InventoryChecker",
        "type": "api",
        "capabilities": ["check_stock", "reserve_inventory"],
        "input_schema": {"product_ids": "array", "quantities": "array"},
        "output_schema": {"in_stock": "boolean", "reserved": "boolean", "reservation_id": "string"}
      },
      {
        "name": "PaymentProcessor",
        "type": "api",
        "capabilities": ["process_payment", "validate_payment_method"],
        "input_schema": {"amount": "number", "payment_method": "object", "order_id": "string"},
        "output_schema": {"transaction_id": "string", "status": "string", "timestamp": "string"}
      },
      {
        "name": "NotificationService",
        "type": "tool",
        "capabilities": ["send_email", "send_sms"],
        "input_schema": {"recipient": "string", "message": "string", "channel": "string"},
        "output_schema": {"sent": "boolean", "message_id": "string"}
      }
    ],
    "iteration_count": 1,
    "output_fields": ["intent_graph", "metadata", "validation"],
    "execution_mode": "sequential",
    "error_handling": "fail_fast"
  }
}
```

### Response:
```json
{
  "jsonrpc": "2.0",
  "id": "req_001",
  "result": {
    "intent_graph": {
      "nodes": [
        {
          "node_id": "node_entry",
          "agent_name": "OrderValidator",
          "agent_type": "validator",
          "node_type": "entry",
          "purpose": "Validate incoming order data structure and required fields",
          "inputs": {
            "order_data": {
              "source": "params.order_data",
              "source_type": "request",
              "source_field": "order_data",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "is_valid",
              "type": "boolean",
              "description": "Whether order passed validation"
            },
            {
              "name": "errors",
              "type": "array",
              "description": "List of validation errors if any"
            },
            {
              "name": "validated_order",
              "type": "object",
              "description": "Cleaned and validated order object"
            }
          ],
          "configuration": {
            "timeout_ms": 5000,
            "retry_policy": {
              "max_attempts": 2,
              "backoff_strategy": "fixed",
              "backoff_ms": 1000
            }
          },
          "error_handling": {
            "strategy": "fail",
            "error_output": "validation_error"
          },
          "metadata": {
            "estimated_duration_ms": 500,
            "cost_estimate": 0.001,
            "priority": "high",
            "tags": ["validation", "order"]
          }
        },
        {
          "node_id": "node_inventory",
          "agent_name": "InventoryChecker",
          "agent_type": "api",
          "node_type": "processing",
          "purpose": "Check inventory availability and reserve items",
          "inputs": {
            "product_ids": {
              "source": "node_entry.validated_order.items",
              "source_type": "node_output",
              "source_node": "node_entry",
              "source_field": "validated_order.items",
              "transformation": "extract_product_ids",
              "required": true
            },
            "quantities": {
              "source": "node_entry.validated_order.items",
              "source_type": "node_output",
              "source_node": "node_entry",
              "source_field": "validated_order.items",
              "transformation": "extract_quantities",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "in_stock",
              "type": "boolean",
              "description": "Whether all items are available"
            },
            {
              "name": "reserved",
              "type": "boolean",
              "description": "Whether items were successfully reserved"
            },
            {
              "name": "reservation_id",
              "type": "string",
              "description": "Unique reservation identifier"
            }
          ],
          "configuration": {
            "timeout_ms": 10000,
            "retry_policy": {
              "max_attempts": 3,
              "backoff_strategy": "exponential",
              "backoff_ms": 500
            }
          },
          "error_handling": {
            "strategy": "fail",
            "error_output": "inventory_error"
          },
          "metadata": {
            "estimated_duration_ms": 2000,
            "cost_estimate": 0.005,
            "priority": "high",
            "tags": ["inventory", "reservation"]
          }
        },
        {
          "node_id": "node_payment",
          "agent_name": "PaymentProcessor",
          "agent_type": "api",
          "node_type": "processing",
          "purpose": "Process payment transaction for validated order",
          "inputs": {
            "amount": {
              "source": "node_entry.validated_order.total",
              "source_type": "node_output",
              "source_node": "node_entry",
              "source_field": "validated_order.total",
              "required": true
            },
            "payment_method": {
              "source": "params.payment_method",
              "source_type": "request",
              "source_field": "payment_method",
              "required": true
            },
            "order_id": {
              "source": "node_entry.validated_order.order_id",
              "source_type": "node_output",
              "source_node": "node_entry",
              "source_field": "validated_order.order_id",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "transaction_id",
              "type": "string",
              "description": "Unique payment transaction identifier"
            },
            {
              "name": "status",
              "type": "string",
              "description": "Payment status (success, failed, pending)"
            },
            {
              "name": "timestamp",
              "type": "string",
              "description": "ISO 8601 timestamp of transaction"
            }
          ],
          "configuration": {
            "timeout_ms": 30000,
            "retry_policy": {
              "max_attempts": 2,
              "backoff_strategy": "fixed",
              "backoff_ms": 2000
            }
          },
          "error_handling": {
            "strategy": "fail",
            "error_output": "payment_error"
          },
          "metadata": {
            "estimated_duration_ms": 5000,
            "cost_estimate": 0.01,
            "priority": "critical",
            "tags": ["payment", "transaction"]
          }
        },
        {
          "node_id": "node_notify",
          "agent_name": "NotificationService",
          "agent_type": "tool",
          "node_type": "exit",
          "purpose": "Send order confirmation notification to customer",
          "inputs": {
            "recipient": {
              "source": "node_entry.validated_order.customer_email",
              "source_type": "node_output",
              "source_node": "node_entry",
              "source_field": "validated_order.customer_email",
              "required": true
            },
            "message": {
              "source": "Order confirmed! Transaction ID: {transaction_id}",
              "source_type": "constant",
              "transformation": "template_with_transaction_id",
              "required": true
            },
            "channel": {
              "source": "email",
              "source_type": "constant",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "sent",
              "type": "boolean",
              "description": "Whether notification was sent successfully"
            },
            {
              "name": "message_id",
              "type": "string",
              "description": "Notification message identifier"
            }
          ],
          "configuration": {
            "timeout_ms": 10000
          },
          "error_handling": {
            "strategy": "skip",
            "error_output": "notification_error"
          },
          "metadata": {
            "estimated_duration_ms": 1000,
            "cost_estimate": 0.002,
            "priority": "normal",
            "tags": ["notification", "email"]
          }
        }
      ],
      "edges": [
        {
          "edge_id": "edge_001",
          "from_node": "node_entry",
          "to_node": "node_inventory",
          "edge_type": "conditional",
          "condition": {
            "expression": "node_entry.is_valid === true",
            "evaluation_context": "node_output"
          },
          "priority": 1,
          "data_mapping": {
            "validated_order": {
              "from_field": "validated_order",
              "to_field": "order_data"
            }
          }
        },
        {
          "edge_id": "edge_002",
          "from_node": "node_inventory",
          "to_node": "node_payment",
          "edge_type": "conditional",
          "condition": {
            "expression": "node_inventory.in_stock === true && node_inventory.reserved === true",
            "evaluation_context": "node_output"
          },
          "priority": 1
        },
        {
          "edge_id": "edge_003",
          "from_node": "node_payment",
          "to_node": "node_notify",
          "edge_type": "conditional",
          "condition": {
            "expression": "node_payment.status === 'success'",
            "evaluation_context": "node_output"
          },
          "priority": 1
        }
      ],
      "execution_plan": {
        "entry_points": ["node_entry"],
        "exit_points": ["node_notify"],
        "execution_strategy": "sequential",
        "parallel_groups": [],
        "critical_path": ["node_entry", "node_inventory", "node_payment", "node_notify"],
        "total_estimated_steps": 4,
        "max_parallel_nodes": 1
      }
    },
    "metadata": {
      "graph_id": "graph_20250102_001",
      "version": "1.0.0",
      "created_at": "2025-10-02T14:30:00Z",
      "agent_purpose": "Process a customer order from validation through payment confirmation",
      "complexity_metrics": {
        "node_count": 4,
        "edge_count": 3,
        "depth": 4,
        "width": 1,
        "complexity_score": 15,
        "cyclomatic_complexity": 3
      },
      "resource_estimates": {
        "estimated_duration_ms": 8500,
        "estimated_cost": 0.018,
        "estimated_tokens": 500,
        "estimated_api_calls": 3
      },
      "optimization_notes": [
        "All nodes are sequential - no parallelization opportunities",
        "Consider caching inventory checks for repeated products",
        "Notification is non-critical and could be async"
      ],
      "warnings": []
    },
    "validation": {
      "is_valid": true,
      "checks_performed": [
        {
          "check_name": "valid_jsonrpc_structure",
          "passed": true,
          "message": "Response conforms to JSON-RPC 2.0"
        },
        {
          "check_name": "all_agents_exist",
          "passed": true,
          "message": "All referenced agents exist in available_agents"
        },
        {
          "check_name": "unique_node_ids",
          "passed": true,
          "message": "All node IDs are unique"
        },
        {
          "check_name": "valid_edge_references",
          "passed": true,
          "message": "All edges reference existing nodes"
        },
        {
          "check_name": "dag_structure",
          "passed": true,
          "message": "Graph is a valid DAG"
        },
        {
          "check_name": "entry_exit_points",
          "passed": true,
          "message": "Entry and exit points clearly defined"
        },
        {
          "check_name": "no_orphaned_nodes",
          "passed": true,
          "message": "All nodes are reachable from entry point"
        }
      ],
      "validation_timestamp": "2025-10-02T14:30:00Z"
    }
  }
}
```

---

## Example 2: Parallel Processing with Aggregation
**Use Case:** Content moderation system that checks text, images, and metadata simultaneously.

### Request:
```json
{
  "jsonrpc": "2.0",
  "method": "generate_graph",
  "id": "req_002",
  "params": {
    "agent_purpose": "Moderate user-generated content by analyzing text sentiment, image safety, and metadata compliance in parallel",
    "available_agents": [
      {
        "name": "TextAnalyzer",
        "type": "llm",
        "capabilities": ["sentiment_analysis", "toxicity_detection", "language_detection"],
        "input_schema": {"text": "string"},
        "output_schema": {"sentiment": "string", "toxicity_score": "number", "flags": "array"}
      },
      {
        "name": "ImageModerator",
        "type": "api",
        "capabilities": ["nsfw_detection", "violence_detection", "brand_safety"],
        "input_schema": {"image_url": "string"},
        "output_schema": {"is_safe": "boolean", "categories": "array", "confidence": "number"}
      },
      {
        "name": "MetadataValidator",
        "type": "validator",
        "capabilities": ["validate_tags", "check_copyright", "verify_licensing"],
        "input_schema": {"metadata": "object"},
        "output_schema": {"is_compliant": "boolean", "violations": "array"}
      },
      {
        "name": "DecisionAggregator",
        "type": "aggregator",
        "capabilities": ["combine_results", "apply_policy", "generate_decision"],
        "input_schema": {"text_result": "object", "image_result": "object", "metadata_result": "object"},
        "output_schema": {"final_decision": "string", "confidence": "number", "reasoning": "string"}
      }
    ],
    "iteration_count": 1,
    "output_fields": ["intent_graph", "metadata", "validation"],
    "execution_mode": "parallel"
  }
}
```

### Response:
```json
{
  "jsonrpc": "2.0",
  "id": "req_002",
  "result": {
    "intent_graph": {
      "nodes": [
        {
          "node_id": "node_entry",
          "agent_name": "ContentRouter",
          "agent_type": "router",
          "node_type": "entry",
          "purpose": "Route content to appropriate analysis agents",
          "inputs": {
            "content": {
              "source": "params.content",
              "source_type": "request",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "text_content",
              "type": "string",
              "description": "Extracted text content"
            },
            {
              "name": "image_url",
              "type": "string",
              "description": "Image URL for analysis"
            },
            {
              "name": "metadata",
              "type": "object",
              "description": "Content metadata"
            }
          ],
          "metadata": {
            "estimated_duration_ms": 100,
            "priority": "high"
          }
        },
        {
          "node_id": "node_text_analysis",
          "agent_name": "TextAnalyzer",
          "agent_type": "llm",
          "node_type": "processing",
          "purpose": "Analyze text content for sentiment and toxicity",
          "inputs": {
            "text": {
              "source": "node_entry.text_content",
              "source_type": "node_output",
              "source_node": "node_entry",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "sentiment",
              "type": "string",
              "description": "Detected sentiment (positive, negative, neutral)"
            },
            {
              "name": "toxicity_score",
              "type": "number",
              "description": "Toxicity score 0-1"
            },
            {
              "name": "flags",
              "type": "array",
              "description": "Content warning flags"
            }
          ],
          "configuration": {
            "timeout_ms": 15000
          },
          "metadata": {
            "estimated_duration_ms": 8000,
            "cost_estimate": 0.02,
            "priority": "high",
            "tags": ["text", "analysis", "parallel"]
          }
        },
        {
          "node_id": "node_image_moderation",
          "agent_name": "ImageModerator",
          "agent_type": "api",
          "node_type": "processing",
          "purpose": "Check image for safety violations",
          "inputs": {
            "image_url": {
              "source": "node_entry.image_url",
              "source_type": "node_output",
              "source_node": "node_entry",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "is_safe",
              "type": "boolean",
              "description": "Whether image passes safety checks"
            },
            {
              "name": "categories",
              "type": "array",
              "description": "Detected content categories"
            },
            {
              "name": "confidence",
              "type": "number",
              "description": "Confidence score 0-1"
            }
          ],
          "configuration": {
            "timeout_ms": 20000
          },
          "metadata": {
            "estimated_duration_ms": 10000,
            "cost_estimate": 0.015,
            "priority": "high",
            "tags": ["image", "moderation", "parallel"]
          }
        },
        {
          "node_id": "node_metadata_validation",
          "agent_name": "MetadataValidator",
          "agent_type": "validator",
          "node_type": "processing",
          "purpose": "Validate metadata compliance",
          "inputs": {
            "metadata": {
              "source": "node_entry.metadata",
              "source_type": "node_output",
              "source_node": "node_entry",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "is_compliant",
              "type": "boolean",
              "description": "Whether metadata is compliant"
            },
            {
              "name": "violations",
              "type": "array",
              "description": "List of compliance violations"
            }
          ],
          "configuration": {
            "timeout_ms": 5000
          },
          "metadata": {
            "estimated_duration_ms": 2000,
            "cost_estimate": 0.005,
            "priority": "normal",
            "tags": ["metadata", "validation", "parallel"]
          }
        },
        {
          "node_id": "node_aggregation",
          "agent_name": "DecisionAggregator",
          "agent_type": "aggregator",
          "node_type": "aggregation",
          "purpose": "Combine all analysis results and make final moderation decision",
          "inputs": {
            "text_result": {
              "source": "node_text_analysis",
              "source_type": "node_output",
              "source_node": "node_text_analysis",
              "required": true
            },
            "image_result": {
              "source": "node_image_moderation",
              "source_type": "node_output",
              "source_node": "node_image_moderation",
              "required": true
            },
            "metadata_result": {
              "source": "node_metadata_validation",
              "source_type": "node_output",
              "source_node": "node_metadata_validation",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "final_decision",
              "type": "string",
              "description": "approve, reject, or review"
            },
            {
              "name": "confidence",
              "type": "number",
              "description": "Decision confidence 0-1"
            },
            {
              "name": "reasoning",
              "type": "string",
              "description": "Explanation of decision"
            }
          ],
          "configuration": {
            "timeout_ms": 3000
          },
          "metadata": {
            "estimated_duration_ms": 1000,
            "cost_estimate": 0.003,
            "priority": "high",
            "tags": ["aggregation", "decision"]
          }
        },
        {
          "node_id": "node_exit",
          "agent_name": "ResultFormatter",
          "agent_type": "transformer",
          "node_type": "exit",
          "purpose": "Format final moderation result",
          "inputs": {
            "decision": {
              "source": "node_aggregation",
              "source_type": "node_output",
              "source_node": "node_aggregation",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "formatted_result",
              "type": "object",
              "description": "Formatted moderation result"
            }
          ],
          "metadata": {
            "estimated_duration_ms": 100,
            "priority": "normal"
          }
        }
      ],
      "edges": [
        {
          "edge_id": "edge_001",
          "from_node": "node_entry",
          "to_node": "node_text_analysis",
          "edge_type": "parallel",
          "priority": 1
        },
        {
          "edge_id": "edge_002",
          "from_node": "node_entry",
          "to_node": "node_image_moderation",
          "edge_type": "parallel",
          "priority": 1
        },
        {
          "edge_id": "edge_003",
          "from_node": "node_entry",
          "to_node": "node_metadata_validation",
          "edge_type": "parallel",
          "priority": 1
        },
        {
          "edge_id": "edge_004",
          "from_node": "node_text_analysis",
          "to_node": "node_aggregation",
          "edge_type": "sequential",
          "priority": 1
        },
        {
          "edge_id": "edge_005",
          "from_node": "node_image_moderation",
          "to_node": "node_aggregation",
          "edge_type": "sequential",
          "priority": 1
        },
        {
          "edge_id": "edge_006",
          "from_node": "node_metadata_validation",
          "to_node": "node_aggregation",
          "edge_type": "sequential",
          "priority": 1
        },
        {
          "edge_id": "edge_007",
          "from_node": "node_aggregation",
          "to_node": "node_exit",
          "edge_type": "sequential",
          "priority": 1
        }
      ],
      "execution_plan": {
        "entry_points": ["node_entry"],
        "exit_points": ["node_exit"],
        "execution_strategy": "hybrid",
        "parallel_groups": [
          {
            "group_id": "parallel_analysis",
            "nodes": ["node_text_analysis", "node_image_moderation", "node_metadata_validation"],
            "execution_mode": "all"
          }
        ],
        "critical_path": ["node_entry", "node_image_moderation", "node_aggregation", "node_exit"],
        "total_estimated_steps": 6,
        "max_parallel_nodes": 3
      }
    },
    "metadata": {
      "graph_id": "graph_20250102_002",
      "version": "1.0.0",
      "created_at": "2025-10-02T14:35:00Z",
      "agent_purpose": "Moderate user-generated content by analyzing text sentiment, image safety, and metadata compliance in parallel",
      "complexity_metrics": {
        "node_count": 6,
        "edge_count": 7,
        "depth": 4,
        "width": 3,
        "complexity_score": 28,
        "cyclomatic_complexity": 1
      },
      "resource_estimates": {
        "estimated_duration_ms": 11200,
        "estimated_cost": 0.043,
        "estimated_tokens": 2000,
        "estimated_api_calls": 3
      },
      "optimization_notes": [
        "Excellent parallelization with 3 concurrent nodes",
        "Image moderation is on critical path - consider optimization",
        "Aggregation could benefit from partial results if any parallel node fails"
      ],
      "warnings": []
    },
    "validation": {
      "is_valid": true,
      "checks_performed": [
        {
          "check_name": "valid_jsonrpc_structure",
          "passed": true
        },
        {
          "check_name": "all_agents_exist",
          "passed": true
        },
        {
          "check_name": "unique_node_ids",
          "passed": true
        },
        {
          "check_name": "valid_edge_references",
          "passed": true
        },
        {
          "check_name": "dag_structure",
          "passed": true
        },
        {
          "check_name": "parallel_sync_points",
          "passed": true,
          "message": "All parallel branches properly synchronize at aggregation node"
        }
      ],
      "validation_timestamp": "2025-10-02T14:35:00Z"
    }
  }
}
```

---

## Example 3: Complex Workflow with Conditional Branching and Error Handling
**Use Case:** Document processing pipeline with OCR, translation, summarization, and quality checks.

### Request:
```json
{
  "jsonrpc": "2.0",
  "method": "generate_graph",
  "id": "req_003",
  "params": {
    "agent_purpose": "Process uploaded documents: detect language, OCR if needed, translate to English, summarize, and quality check",
    "available_agents": [
      {
        "name": "LanguageDetector",
        "type": "llm",
        "capabilities": ["detect_language", "detect_encoding"],
        "input_schema": {"text": "string"},
        "output_schema": {"language": "string", "confidence": "number"}
      },
      {
        "name": "OCRProcessor",
        "type": "api",
        "capabilities": ["extract_text", "handle_images", "handle_pdfs"],
        "input_schema": {"document_url": "string", "document_type": "string"},
        "output_schema": {"extracted_text": "string", "page_count": "number"}
      },
      {
        "name": "Translator",
        "type": "api",
        "capabilities": ["translate_text", "support_100_languages"],
        "input_schema": {"text": "string", "source_lang": "string", "target_lang": "string"},
        "output_schema": {"translated_text": "string", "translation_quality": "number"}
      },
      {
        "name": "Summarizer",
        "type": "llm",
        "capabilities": ["extract_summary", "key_points", "actionable_items"],
        "input_schema": {"text": "string", "max_length": "number"},
        "output_schema": {"summary": "string", "key_points": "array", "word_count": "number"}
      },
      {
        "name": "QualityChecker",
        "type": "validator",
        "capabilities": ["check_completeness", "verify_accuracy"],
        "input_schema": {"original": "string", "processed": "string"},
        "output_schema": {"quality_score": "number", "issues": "array"}
      },
      {
        "name": "FallbackHandler",
        "type": "error_handler",
        "capabilities": ["retry_logic", "alternative_processing"],
        "input_schema": {"error": "object", "context": "object"},
        "output_schema": {"recovery_action": "string", "recovered": "boolean"}
      }
    ],
    "iteration_count": 2,
    "output_fields": ["intent_graph", "metadata", "validation"],
    "execution_mode": "hybrid",
    "error_handling": "retry",
    "special_requests": "Include quality checks and retry logic for OCR failures"
  }
}
```

### Response:
```json
{
  "jsonrpc": "2.0",
  "id": "req_003",
  "result": {
    "intent_graph": {
      "nodes": [
        {
          "node_id": "node_lang_detect",
          "agent_name": "LanguageDetector",
          "agent_type": "llm",
          "node_type": "entry",
          "purpose": "Detect document language and encoding",
          "inputs": {
            "text": {
              "source": "params.document_text",
              "source_type": "request",
              "required": false
            }
          },
          "outputs": [
            {
              "name": "language",
              "type": "string",
              "description": "ISO 639-1 language code"
            },
            {
              "name": "confidence",
              "type": "number",
              "description": "Detection confidence 0-1"
            }
          ],
          "configuration": {
            "timeout_ms": 5000
          },
          "metadata": {
            "estimated_duration_ms": 2000,
            "priority": "high"
          }
        },
        {
          "node_id": "node_ocr",
          "agent_name": "OCRProcessor",
          "agent_type": "api",
          "node_type": "processing",
          "purpose": "Extract text from document using OCR",
          "inputs": {
            "document_url": {
              "source": "params.document_url",
              "source_type": "request",
              "required": true
            },
            "document_type": {
              "source": "params.document_type",
              "source_type": "request",
              "default_value": "pdf",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "extracted_text",
              "type": "string",
              "description": "OCR extracted text"
            },
            {
              "name": "page_count",
              "type": "number",
              "description": "Number of pages processed"
            }
          ],
          "configuration": {
            "timeout_ms": 60000,
            "retry_policy": {
              "max_attempts": 3,
              "backoff_strategy": "exponential",
              "backoff_ms": 2000
            }
          },
          "error_handling": {
            "strategy": "fallback",
            "fallback_node": "node_error_handler"
          },
          "metadata": {
            "estimated_duration_ms": 30000,
            "cost_estimate": 0.05,
            "priority": "high",
            "tags": ["ocr", "expensive"]
          }
        },
        {
          "node_id": "node_translate",
          "agent_name": "Translator",
          "agent_type": "api",
          "node_type": "decision",
          "purpose": "Translate non-English documents to English",
          "inputs": {
            "text": {
              "source": "node_ocr.extracted_text",
              "source_type": "node_output",
              "source_node": "node_ocr",
              "required": true
            },
            "source_lang": {
              "source": "node_lang_detect.language",
              "source_type": "node_output",
              "source_node": "node_lang_detect",
              "required": true
            },
            "target_lang": {
              "source": "en",
              "source_type": "constant",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "translated_text",
              "type": "string",
              "description": "English translation"
            },
            {
              "name": "translation_quality",
              "type": "number",
              "description": "Quality score 0-1"
            }
          ],
          "configuration": {
            "timeout_ms": 30000
          },
          "metadata": {
            "estimated_duration_ms": 15000,
            "cost_estimate": 0.03,
            "priority": "high"
          }
        },
        {
          "node_id": "node_summarize",
          "agent_name": "Summarizer",
          "agent_type": "llm",
          "node_type": "processing",
          "purpose": "Generate concise summary with key points",
          "inputs": {
            "text": {
              "source": "node_translate.translated_text",
              "source_type": "node_output",
              "source_node": "node_translate",
              "required": true
            },
            "max_length": {
              "source": "500",
              "source_type": "constant",
              "required": false
            }
          },
          "outputs": [
            {
              "name": "summary",
              "type": "string",
              "description": "Document summary"
            },
            {
              "name": "key_points",
              "type": "array",
              "description": "List of key points"
            },
            {
              "name": "word_count",
              "type": "number",
              "description": "Summary word count"
            }
          ],
          "configuration": {
            "timeout_ms": 20000
          },
          "metadata": {
            "estimated_duration_ms": 10000,
            "cost_estimate": 0.025,
            "priority": "normal"
          }
        },
        {
          "node_id": "node_quality_check",
          "agent_name": "QualityChecker",
          "agent_type": "validator",
          "node_type": "processing",
          "purpose": "Verify processing quality and completeness",
          "inputs": {
            "original": {
              "source": "node_ocr.extracted_text",
              "source_type": "node_output",
              "source_node": "node_ocr",
              "required": true
            },
            "processed": {
              "source": "node_summarize.summary",
              "source_type": "node_output",
              "source_node": "node_summarize",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "quality_score",
              "type": "number",
              "description": "Overall quality score 0-100"
            },
            {
              "name": "issues",
              "type": "array",
              "description": "List of quality issues found"
            }
          ],
          "configuration": {
            "timeout_ms": 10000
          },
          "metadata": {
            "estimated_duration_ms": 5000,
            "priority": "normal"
          }
        },
        {
          "node_id": "node_error_handler",
          "agent_name": "FallbackHandler",
          "agent_type": "error_handler",
          "node_type": "error_handler",
          "purpose": "Handle OCR failures with alternative processing",
          "inputs": {
            "error": {
              "source": "node_ocr.error",
              "source_type": "node_output",
              "source_node": "node_ocr",
              "required": true
            },
            "context": {
              "source": "execution_context",
              "source_type": "context",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "recovery_action",
              "type": "string",
              "description": "Action taken for recovery"
            },
            {
              "name": "recovered",
              "type": "boolean",
              "description": "Whether recovery was successful"
            }
          ],
          "configuration": {
            "timeout_ms": 5000
          },
          "metadata": {
            "estimated_duration_ms": 2000,
            "priority": "high"
          }
        },
        {
          "node_id": "node_exit",
          "agent_name": "ResultAggregator",
          "agent_type": "aggregator",
          "node_type": "exit",
          "purpose": "Compile final processing results",
          "inputs": {
            "summary": {
              "source": "node_summarize",
              "source_type": "node_output",
              "source_node": "node_summarize",
              "required": true
            },
            "quality": {
              "source": "node_quality_check",
              "source_type": "node_output",
              "source_node": "node_quality_check",
              "required": true
            }
          },
          "outputs": [
            {
              "name": "final_result",
              "type": "object",
              "description": "Complete processing result"
            }
          ],
          "metadata": {
            "estimated_duration_ms": 500,
            "priority": "normal"
          }
        }
      ],
      "edges": [
        {
          "edge_id": "edge_001",
          "from_node": "node_lang_detect",
          "to_node": "node_ocr",
          "edge_type": "sequential",
          "priority": 1
        },
        {
          "edge_id": "edge_002",
          "from_node": "node_ocr",
          "to_node": "node_translate",
          "edge_type": "conditional",
          "condition": {
            "expression": "node_lang_detect.language !== 'en' && node_lang_detect.confidence > 0.8",
            "evaluation_context": "node_output"
          },
          "priority": 1
        },
        {
          "edge_id": "edge_003",
          "from_node": "node_ocr",
          "to_node": "node_summarize",
          "edge_type": "conditional",
          "condition": {
            "expression": "node_lang_detect.language === 'en' || node_lang_detect.confidence <= 0.8",
            "evaluation_context": "node_output"
          },
          "priority": 2
        },
        {
          "edge_id": "edge_004",
          "from_node": "node_translate",
          "to_node": "node_summarize",
          "edge_type": "sequential",
          "priority": 1
        },
        {
          "edge_id": "edge_005",
          "from_node": "node_summarize",
          "to_node": "node_quality_check",
          "edge_type": "sequential",
          "priority": 1
        },
        {
          "edge_id": "edge_006",
          "from_node": "node_quality_check",
          "to_node": "node_exit",
          "edge_type": "conditional",
          "condition": {
            "expression": "node_quality_check.quality_score >= 70",
            "evaluation_context": "node_output"
          },
          "priority": 1
        },
        {
          "edge_id": "edge_007",
          "from_node": "node_quality_check",
          "to_node": "node_lang_detect",
          "edge_type": "iteration",
          "condition": {
            "expression": "node_quality_check.quality_score < 70 && iteration_count < max_iterations",
            "evaluation_context": "both"
          },
          "priority": 2
        },
        {
          "edge_id": "edge_008",
          "from_node": "node_ocr",
          "to_node": "node_error_handler",
          "edge_type": "fallback",
          "priority": 1
        },
        {
          "edge_id": "edge_009",
          "from_node": "node_error_handler",
          "to_node": "node_exit",
          "edge_type": "sequential",
          "priority": 1
        }
      ],
      "execution_plan": {
        "entry_points": ["node_lang_detect"],
        "exit_points": ["node_exit"],
        "execution_strategy": "hybrid",
        "parallel_groups": [],
        "critical_path": ["node_lang_detect", "node_ocr", "node_translate", "node_summarize", "node_quality_check", "node_exit"],
        "total_estimated_steps": 7,
        "max_parallel_nodes": 1,
        "iteration_config": {
          "max_iterations": 2,
          "convergence_criteria": "node_quality_check.quality_score >= 70",
          "iteration_nodes": ["node_lang_detect", "node_ocr", "node_translate", "node_summarize", "node_quality_check"]
        }
      }
    },
    "metadata": {
      "graph_id": "graph_20250102_003",
      "version": "1.0.0",
      "created_at": "2025-10-02T14:40:00Z",
      "agent_purpose": "Process uploaded documents: detect language, OCR if needed, translate to English, summarize, and quality check",
      "complexity_metrics": {
        "node_count": 7,
        "edge_count": 9,
        "depth": 6,
        "width": 1,
        "complexity_score": 65,
        "cyclomatic_complexity": 5
      },
      "resource_estimates": {
        "estimated_duration_ms": 64500,
        "estimated_cost": 0.135,
        "estimated_tokens": 5000,
        "estimated_api_calls": 4
      },
      "optimization_notes": [
        "High complexity due to conditional branching and iteration",
        "OCR is expensive - consider caching results",
        "Translation only runs for non-English documents (efficient branching)",
        "Quality check enables iterative refinement up to 2 iterations",
        "Error handler provides graceful degradation for OCR failures"
      ],
      "warnings": [
        {
          "severity": "medium",
          "message": "Graph contains iteration loop - ensure termination condition is reliable",
          "node_id": "node_quality_check"
        },
        {
          "severity": "low",
          "message": "OCR node has high cost and duration - monitor closely",
          "node_id": "node_ocr"
        }
      ]
    },
    "validation": {
      "is_valid": true,
      "checks_performed": [
        {
          "check_name": "valid_jsonrpc_structure",
          "passed": true
        },
        {
          "check_name": "all_agents_exist",
          "passed": true
        },
        {
          "check_name": "unique_node_ids",
          "passed": true
        },
        {
          "check_name": "valid_edge_references",
          "passed": true
        },
        {
          "check_name": "conditional_logic_complete",
          "passed": true,
          "message": "All conditional branches have proper conditions and fallback paths"
        },
        {
          "check_name": "iteration_termination",
          "passed": true,
          "message": "Iteration loop has explicit convergence criteria and max iterations"
        },
        {
          "check_name": "error_handling_coverage",
          "passed": true,
          "message": "All critical nodes have error handling strategies"
        }
      ],
      "validation_timestamp": "2025-10-02T14:40:00Z"
    }
  }
}
```

---

## Example 4: Error Response
**Use Case:** Invalid request with missing parameters.

### Request:
```json
{
  "jsonrpc": "2.0",
  "method": "generate_graph",
  "id": "req_error_001",
  "params": {
    "agent_purpose": "Process customer data",
    "iteration_count": 1
  }
}
```

### Response:
```json
{
  "jsonrpc": "2.0",
  "id": "req_error_001",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "details": "Missing required parameters: available_agents, output_fields",
      "received_params": {
        "agent_purpose": "Process customer data",
        "iteration_count": 1
      },
      "required_params": [
        "agent_purpose",
        "available_agents",
        "iteration_count",
        "output_fields"
      ]
    }
  }
}
```

---

## Key Patterns Demonstrated

1. **Sequential Flow**: Example 1 shows linear execution with conditional edges
2. **Parallel Processing**: Example 2 demonstrates concurrent execution with synchronization
3. **Complex Branching**: Example 3 includes conditional logic, iteration, and error handling
4. **Error Handling**: Example 4 shows proper JSON-RPC error responses

All examples follow the IntentGraph Schema v1.0 specification for consistency across applications.
