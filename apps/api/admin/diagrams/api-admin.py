from diagrams import Diagram
from diagrams.aws.network import APIGatewayEndpoint
from diagrams.aws.integration import EventbridgeCustomEventBusResource

graph_attr = {
  "pad": "0.75",
}

with Diagram("API Admin", show=False, direction="TB", filename="api-admin", graph_attr=graph_attr):
  APIGatewayEndpoint("/hook/external-event/\n(course|participant|member)") >> EventbridgeCustomEventBusResource("EXT\n(course|participant|member)\n(created|updated)")
