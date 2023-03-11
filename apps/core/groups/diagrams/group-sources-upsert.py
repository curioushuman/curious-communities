from diagrams import Cluster, Diagram
from diagrams.custom import Custom
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource

graph_attr = {
    "overlap": "false"
}

with Diagram("Upsert group sources", show=False, filename="group-sources-upsert", direction="TB", graph_attr=graph_attr):
  int_event_bus_group_created = EventbridgeCustomEventBusResource("INT\ngroup\ncreated")
  int_event_bus_group_updated = EventbridgeCustomEventBusResource("INT\ngroup\nupdated")

  with Cluster("Upsert groups sources\nstate machine"):
    lambda_group_source_upsert = LambdaFunction("group-source-upsert")
    lambda_group_update = LambdaFunction("group-update")

  # Community
  api_community_img_path = "../../../../assets/logos/tribe.png"
  api_community = Custom("Community API", api_community_img_path)

  # Micro-courses
  api_micro_courses_img_path = "../../../../assets/logos/edapp.png"
  api_micro_courses = Custom("Micro-courses API", api_micro_courses_img_path)

  int_event_bus_group_created >> lambda_group_source_upsert
  int_event_bus_group_updated >> lambda_group_source_upsert
  lambda_group_source_upsert >> api_community
  lambda_group_source_upsert >> api_micro_courses
  lambda_group_source_upsert >> lambda_group_update
