import strawberry
from strawberry.fastapi import GraphQLRouter

from frait_health_backend.web.gql import (
    family_details,
    frai_assessment_details,
    frat_assessment_details,
    initial_family,
    user
)
from frait_health_backend.web.gql.context import Context, get_context


@strawberry.type
class Query(
    initial_family.Query,
    family_details.Query,
    frat_assessment_details.Query,
    frai_assessment_details.Query,
    user.Query
):
    """Main query."""


@strawberry.type
class Mutation(
    initial_family.Mutation,
    family_details.Mutation,
    frat_assessment_details.Mutation,
    frai_assessment_details.Mutation,
    user.Mutation
):
    """Main mutation."""


schema = strawberry.Schema(
    Query,
    Mutation,
)

gql_router: GraphQLRouter[Context, None] = GraphQLRouter(
    schema,
    graphiql=True,
    context_getter=get_context,
)
