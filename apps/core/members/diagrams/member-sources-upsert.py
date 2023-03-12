from diagrams import Cluster, Diagram
from diagrams.custom import Custom
from diagrams.aws.compute import LambdaFunction
from diagrams.aws.integration import EventbridgeCustomEventBusResource

graph_attr = {
    "pad": "0.75",
}

with Diagram("Upsert member sources", show=False, filename="member-sources-upsert", direction="TB", graph_attr=graph_attr):
  int_event_bus_member_created = EventbridgeCustomEventBusResource("INT\nmember\ncreated")
  int_event_bus_member_updated = EventbridgeCustomEventBusResource("INT\nmember\nupdated")

  with Cluster("Upsert members sources\nstate machine"):
    lambda_member_source_upsert = LambdaFunction("member-source-upsert")
    lambda_member_update = LambdaFunction("member-update")

  # Community
  api_community_img_path = "../../../../assets/logos/tribe.png"
  api_community = Custom("Community API", api_community_img_path)

  # Auth
  api_auth_img_path = "../../../../assets/logos/auth0.png"
  api_auth = Custom("Auth API", api_auth_img_path)

  # Micro-courses
  api_micro_courses_img_path = "../../../../assets/logos/edapp.png"
  api_micro_courses = Custom("Micro-courses API", api_micro_courses_img_path)

  int_event_bus_member_created >> lambda_member_source_upsert
  int_event_bus_member_updated >> lambda_member_source_upsert
  lambda_member_source_upsert >> api_community
  lambda_member_source_upsert >> api_auth
  lambda_member_source_upsert >> api_micro_courses
  lambda_member_source_upsert >> lambda_member_update
