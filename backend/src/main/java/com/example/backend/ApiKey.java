package com.example.backend;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity 
@Table(name = "api_keys")
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String apiKey;
    private String owner;
    private int rateLimit;
    private int windowSeconds;

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }

    

    public String getApiKey(){
        return apiKey;
    }
    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
    
    

    public String getOwner() {
        return owner;
    }
    public void setOwner(String owner) {
        this.owner = owner;
    }
    


    public int getRateLimit(){
        return rateLimit;
    }
    public void setRateLimit(int rateLimit) {
        this.rateLimit = rateLimit;
    }
    

    public int getWindowSeconds(){
        return windowSeconds;
    }
    public void setWindowSeconds(int windowSeconds) {
        this.windowSeconds = windowSeconds;
    }
}