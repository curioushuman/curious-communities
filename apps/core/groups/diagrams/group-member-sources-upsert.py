from diagrams import Cluster, Diagram
from diagrams.custom import Custom
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource

graph_attr = {
    "pad": "0.75",
}

with Diagram("Upsert group member sources", show=False, filename="group-member-sources-upsert", direction="TB", graph_attr=graph_attr):
  int_event_bus_group_member_created = EventbridgeCustomEventBusResource("INT\ngroup-member\ncreated")
  int_event_bus_group_member_updated = EventbridgeCustomEventBusResource("INT\ngroup-member\nupdated")

  with Cluster("Upsert group members sources\nstate machine"):
    lambda_group_member_source_upsert = LambdaFunction("group-member-source-upsert")

  # Community
  api_community_img_path = "../../../../assets/logos/tribe.png"
  api_community = Custom("Community API", api_community_img_path)

  # Micro-courses
  api_micro_courses_img_path = "../../../../assets/logos/edapp.png"
  api_micro_courses = Custom("Micro-courses API", api_micro_courses_img_path)

  int_event_bus_group_member_created >> lambda_group_member_source_upsert
  int_event_bus_group_member_updated >> lambda_group_member_source_upsert
  lambda_group_member_source_upsert >> api_community
  lambda_group_member_source_upsert >> api_micro_courses
