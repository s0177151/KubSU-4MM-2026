from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    print(1000/0)
    x=[1,2]
    print(x[3])
    a=10
    if (a>10):
        while(a<10):
            print(x[10])
        print(a)
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
