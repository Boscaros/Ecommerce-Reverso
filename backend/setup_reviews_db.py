from database import engine, Base
import models

print("Creating new tables...")
# Base.metadata.create_all(bind=engine) will create any tables that don't exist yet
# It will safely skip existing ones
Base.metadata.create_all(bind=engine)
print("Done!")
